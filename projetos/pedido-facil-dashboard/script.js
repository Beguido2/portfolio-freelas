const orderForm = document.querySelector('#orderForm');
const customerNameInput = document.querySelector('#customerName');
const orderItemSelect = document.querySelector('#orderItem');
const orderQuantityInput = document.querySelector('#orderQuantity');
const orderStatusSelect = document.querySelector('#orderStatus');
const ordersTableBody = document.querySelector('#ordersTableBody');
const emptyState = document.querySelector('#emptyState');
const formFeedback = document.querySelector('#formFeedback');
const filterButtons = document.querySelectorAll('.filter-btn');
const seedDemoBtn = document.querySelector('#seedDemoBtn');

const totalRevenueEl = document.querySelector('#totalRevenue');
const totalOrdersEl = document.querySelector('#totalOrders');
const preparingOrdersEl = document.querySelector('#preparingOrders');
const deliveredOrdersEl = document.querySelector('#deliveredOrders');
const popularItemsEl = document.querySelector('#popularItems');

const STORAGE_KEY = 'pedidoFacilOrders';

let orders = loadOrders();
let currentFilter = 'all';

const demoOrders = [
  {
    id: crypto.randomUUID(),
    customer: 'Marina',
    item: 'Smash Burger',
    quantity: 2,
    price: 28,
    status: 'preparing',
  },
  {
    id: crypto.randomUUID(),
    customer: 'Rafael',
    item: 'Duplo Bacon',
    quantity: 1,
    price: 36,
    status: 'delivered',
  },
  {
    id: crypto.randomUUID(),
    customer: 'Bianca',
    item: 'Batata + Refrigerante',
    quantity: 3,
    price: 22,
    status: 'preparing',
  },
  {
    id: crypto.randomUUID(),
    customer: 'João',
    item: 'Veggie Burger',
    quantity: 1,
    price: 32,
    status: 'canceled',
  },
];

function loadOrders() {
  const savedOrders = localStorage.getItem(STORAGE_KEY);
  return savedOrders ? JSON.parse(savedOrders) : [];
}

function saveOrders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function getStatusLabel(status) {
  const labels = {
    preparing: 'Em preparo',
    delivered: 'Entregue',
    canceled: 'Cancelado',
  };

  return labels[status] || status;
}

function getFilteredOrders() {
  if (currentFilter === 'all') {
    return orders;
  }

  return orders.filter((order) => order.status === currentFilter);
}

function updateMetrics() {
  const validOrders = orders.filter((order) => order.status !== 'canceled');
  const totalRevenue = validOrders.reduce((sum, order) => sum + order.price * order.quantity, 0);
  const preparingOrders = orders.filter((order) => order.status === 'preparing').length;
  const deliveredOrders = orders.filter((order) => order.status === 'delivered').length;

  totalRevenueEl.textContent = formatCurrency(totalRevenue);
  totalOrdersEl.textContent = orders.length;
  preparingOrdersEl.textContent = preparingOrders;
  deliveredOrdersEl.textContent = deliveredOrders;
}

function updatePopularItems() {
  const validOrders = orders.filter((order) => order.status !== 'canceled');
  const itemCount = validOrders.reduce((acc, order) => {
    acc[order.item] = (acc[order.item] || 0) + order.quantity;
    return acc;
  }, {});

  const sortedItems = Object.entries(itemCount).sort((a, b) => b[1] - a[1]);

  if (sortedItems.length === 0) {
    popularItemsEl.innerHTML = '<p class="empty-text">Adicione pedidos para ver o ranking.</p>';
    return;
  }

  popularItemsEl.innerHTML = sortedItems
    .map(([item, count]) => `
      <div class="popular-item">
        <strong>${item}</strong>
        <span>${count} un.</span>
      </div>
    `)
    .join('');
}

function renderOrders() {
  const filteredOrders = getFilteredOrders();

  ordersTableBody.innerHTML = '';

  if (filteredOrders.length === 0) {
    emptyState.classList.add('active');
    updateMetrics();
    updatePopularItems();
    return;
  }

  emptyState.classList.remove('active');

  filteredOrders.forEach((order) => {
    const row = document.createElement('tr');
    const total = order.price * order.quantity;

    row.innerHTML = `
      <td>${order.customer}</td>
      <td>${order.item}</td>
      <td>${order.quantity}</td>
      <td>${formatCurrency(total)}</td>
      <td><span class="status-pill status-${order.status}">${getStatusLabel(order.status)}</span></td>
      <td>
        <div class="action-buttons">
          <button class="action-btn deliver" type="button" data-action="deliver" data-id="${order.id}">Entregar</button>
          <button class="action-btn cancel" type="button" data-action="cancel" data-id="${order.id}">Cancelar</button>
          <button class="action-btn delete" type="button" data-action="delete" data-id="${order.id}">Excluir</button>
        </div>
      </td>
    `;

    ordersTableBody.appendChild(row);
  });

  updateMetrics();
  updatePopularItems();
}

function addOrder(event) {
  event.preventDefault();

  const selectedOption = orderItemSelect.options[orderItemSelect.selectedIndex];
  const price = Number(selectedOption.dataset.price);
  const quantity = Number(orderQuantityInput.value);

  if (!customerNameInput.value.trim() || !orderItemSelect.value || quantity < 1) {
    formFeedback.textContent = 'Preencha os dados do pedido corretamente.';
    return;
  }

  const newOrder = {
    id: crypto.randomUUID(),
    customer: customerNameInput.value.trim(),
    item: orderItemSelect.value,
    quantity,
    price,
    status: orderStatusSelect.value,
  };

  orders.unshift(newOrder);
  saveOrders();
  renderOrders();

  orderForm.reset();
  orderQuantityInput.value = 1;
  formFeedback.textContent = 'Pedido adicionado com sucesso.';

  window.setTimeout(() => {
    formFeedback.textContent = '';
  }, 2500);
}

function handleOrderAction(event) {
  const button = event.target.closest('button[data-action]');

  if (!button) return;

  const { action, id } = button.dataset;

  if (action === 'delete') {
    orders = orders.filter((order) => order.id !== id);
  }

  if (action === 'deliver') {
    orders = orders.map((order) =>
      order.id === id ? { ...order, status: 'delivered' } : order
    );
  }

  if (action === 'cancel') {
    orders = orders.map((order) =>
      order.id === id ? { ...order, status: 'canceled' } : order
    );
  }

  saveOrders();
  renderOrders();
}

function handleFilterClick(event) {
  const button = event.target.closest('.filter-btn');

  if (!button) return;

  currentFilter = button.dataset.filter;

  filterButtons.forEach((item) => {
    item.classList.toggle('active', item === button);
  });

  renderOrders();
}

function seedDemoOrders() {
  orders = [...demoOrders];
  saveOrders();
  renderOrders();
}

orderForm.addEventListener('submit', addOrder);
ordersTableBody.addEventListener('click', handleOrderAction);
filterButtons.forEach((button) => button.addEventListener('click', handleFilterClick));
seedDemoBtn.addEventListener('click', seedDemoOrders);

renderOrders();
