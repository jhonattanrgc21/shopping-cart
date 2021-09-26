// Declaracion de constantes
const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
const templateCard = document.getElementById('template-card').content;
const templateFooter = document.getElementById('template-footer').content;
const templateCart = document.getElementById('template-cart').content;
const fragment = document.createDocumentFragment();

// Declaracion de variables
let cart = {};

// Declarcion de eventos
document.addEventListener('DOMContentLoaded', () => {
    /* Ejecuta la funcion fetchData justo despues
    de cargar el DOM completamente */
    fetchData();
    if (localStorage.getItem('cart')) {
        cart = JSON.parse(localStorage.getItem('cart'));
        printCart();
    }
});

cards.addEventListener('click', e => {
    // Detecta los clicks en las cards
    addCart(e);
})

items.addEventListener('click', e => {
    // Aumenta o recude la cantidad de items comprados
    btn_increase_decrease(e);
})

// Desarrollo de funciones
const fetchData = async () => {
    /*  Consulta el archivo api.json que representa el
        backend y obtiene la informacion en formato JSON */
    try {
        const res = await fetch('api.json');
        const data = await res.json();
        printCards(data);
    } catch (error) {
        console.log(error);
    }
}

const printCards = data => {
    /* Imprime la informacion de los articulos en cards */
    data.forEach(product => {
        // Titulo y precio
        templateCard.querySelector('h5').textContent = product.title;
        templateCard.querySelector('p').textContent = product.price;

        // Agrega el link de la imagen al atributo src
        templateCard.querySelector('img').setAttribute("src", product.thumbnailUrl);

        // Crea el atributo data-id en el boton
        templateCard.querySelector('.btn-dark').dataset.id = product.id;

        /*  Clona el contenido del template-card y lo 
            insertandolo en el fragmento */
        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone);
    });
    cards.appendChild(fragment);
};

const addCart = e => {
    /* Detecta un click en el boton de compra */
    if(e.target.classList.contains('btn-dark'))
        setcart(e.target.parentElement);
    e.stopPropagation();
}

const setcart = input => {
    /* Aagrega productos al carrito */
    const product = {
        id: input.querySelector('.btn-dark').dataset.id,
        title: input.querySelector('h5').textContent,
        price: input.querySelector('p').textContent,
        amount: 1
    }

    /*  Si un producto ya se encuentra en el carrito, se
        aumenta la cantidad al darle al boton de compra */
    if (cart.hasOwnProperty(product.id))
        product.amount = cart[product.id].amount + 1

    // Añadiendo e imprimiendo el carrito
    cart[product.id] = { ...product }
    printCart();
}

const printCart = () => {
    /* Imprime el carrito de compra */
    items.innerHTML = '';
    Object.values(cart).forEach(product => {
        templateCart.querySelector('th').textContent = product.id;
        templateCart.querySelectorAll('td')[1].textContent = product.amount;
        templateCart.querySelectorAll('td')[0].textContent = product.title;
        templateCart.querySelector('.btn-info').dataset.id = product.id;
        templateCart.querySelector('.btn-danger').dataset.id = product.id;
        templateCart.querySelector('span').textContent = product.price * product.amount;
        const clone = templateCart.cloneNode(true);
        fragment.appendChild(clone);
    })
    items.appendChild(fragment);
    printFooter();

    // Actualiza el carrito en el localStorage
    localStorage.setItem('cart', JSON.stringify(cart))
}

const printFooter = () => {
    /* Imprime el total acumulado en el carrito */
    footer.innerHTML = '';
    if(Object.keys(cart).length === 0){
        footer.innerHTML = `
            <th scope="row" colspan="5">cart vacío - comience a comprar!</th>
        `;
        return
    }

    // Oobtiene la cantidad acumulada de productos
    const nCart = Object.values(cart).reduce((acum, {amount}) => acum + amount, 0);

    // Obtiene el precio total a pagar
    const nPrice = Object.values(cart).reduce((acum, {amount, price}) => acum + amount * price, 0);

    templateFooter.querySelectorAll('td')[0].textContent = nCart;
    templateFooter.querySelector('span').textContent = nPrice;
    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);

    const empty_cart = document.getElementById('vaciar-carrito');
    empty_cart.addEventListener('click', (e) => {
        cart = {};
        printCart();
    })
}

const btn_increase_decrease = e => {
    /*  Aumenta o disminuye la cantidad de articulos
        en el carrito */
    if(e.target.classList.contains('btn-info')){
        const product = cart[e.target.dataset.id];
        product.amount++;
        cart[e.target.dataset.id] = { ...product };
        printCart();
    }

    if(e.target.classList.contains('btn-danger')){
        const product = cart[e.target.dataset.id]
        product.amount--
        if (product.amount === 0)
            delete cart[e.target.dataset.id]
        else
            cart[e.target.dataset.id] = {...product}
        printCart();
    }

    e.stopPropagation();
}