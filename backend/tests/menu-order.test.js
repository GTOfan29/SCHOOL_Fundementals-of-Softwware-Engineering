const { expect } = require('chai');
const sinon = require('sinon');
const MenuItem = require('../src/models/MenuItem');
const OrderItem = require('../src/models/OrderItem');
const pool = require('../src/config/database');

describe('Menü ve Sipariş Testleri', () => {
  let testMenuItem;
  let testOrder;
  let poolQueryStub, poolConnectStub, mockClient;

  beforeEach(() => {
    // pool.query için mock (doğrudan pool.query kullanan metodlar için)
    poolQueryStub = sinon.stub(pool, 'query');

    // pool.connect için mock (pool.connect ve client.query kullanan metodlar için)
    mockClient = {
      query: sinon.stub(),
      release: sinon.stub()
    };
    poolConnectStub = sinon.stub(pool, 'connect').resolves(mockClient);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Menü Öğesi Testleri', () => {
    it('tüm menü öğelerini kategori ve isme göre sıralı şekilde getirmelidir', async () => {
      const mockItems = [
        { item_id: 1, name: 'Burger', category: 'Ana Yemek', price: 10.99 },
        { item_id: 3, name: 'Salata', category: 'Ana Yemek', price: 8.99 },
        { item_id: 2, name: 'Patates Kızartması', category: 'Yan Ürünler', price: 4.99 }
      ];
      mockClient.query.resolves({ rows: mockItems });

      const items = await MenuItem.getAllItems();
      expect(items).to.be.an('array');
      expect(items.length).to.equal(3);
      expect(items[0].category).to.equal('Ana Yemek');
      expect(items[0].name).to.equal('Burger');
      expect(items[1].category).to.equal('Ana Yemek');
      expect(items[1].name).to.equal('Salata');
      expect(items[2].category).to.equal('Yan Ürünler');
    });

    it('kategoriye göre öğeleri getirmelidir', async () => {
      const mockItems = [
        { item_id: 1, name: 'Burger', category: 'Ana Yemek', price: 10.99 },
        { item_id: 3, name: 'Salata', category: 'Ana Yemek', price: 8.99 }
      ];
      mockClient.query.resolves({ rows: mockItems });

      const items = await MenuItem.getItemsByCategory('Ana Yemek');
      expect(items).to.be.an('array');
      expect(items.length).to.equal(2);
      items.forEach(item => {
        expect(item.category).to.equal('Ana Yemek');
      });
    });

    it('belirli bir menü öğesini ID ile getirmelidir', async () => {
      const mockItem = {
        item_id: 1,
        name: 'Burger',
        description: 'Lezzetli burger',
        price: 10.99,
        category: 'Ana Yemek',
        image_url: 'burger.jpg'
      };
      mockClient.query.resolves({ rows: [mockItem] });

      const item = await MenuItem.getItemById(1);
      expect(item).to.be.an('object');
      expect(item.item_id).to.equal(1);
      expect(item).to.have.all.keys(['item_id', 'name', 'description', 'price', 'category', 'image_url']);
    });
  });

  describe('Sipariş Yaşam Döngüsü Testleri', () => {
    beforeEach(() => {
      testMenuItem = {
        item_id: 1,
        name: 'Burger',
        price: 10.99
      };
    });

    it('yeni bir sipariş oluşturmalıdır', async () => {
      const mockOrder = {
        item_id: testMenuItem.item_id,
        quantity: 2,
        table_num: 1,
        notes: 'Ekstra acılı lütfen',
        status: 'pending',
        created_at: new Date()
      };
      poolQueryStub.resolves({ rows: [mockOrder] });

      const order = await OrderItem.create(
        testMenuItem.item_id,
        2,
        1,
        'Ekstra acılı lütfen'
      );
      expect(order).to.be.an('object');
      expect(order.item_id).to.equal(testMenuItem.item_id);
      expect(order.quantity).to.equal(2);
      expect(order.table_num).to.equal(1);
      expect(order.notes).to.equal('Ekstra acılı lütfen');
      expect(order.status).to.equal('pending');
      testOrder = order;
    });

    it('sipariş durumunu yaşam döngüsü boyunca güncellemelidir', async () => {
      // updateStatus için, önce checkQuery, sonra update query çağrıları
      const createdAt = new Date();
      const checkResult = { rows: [{ created_at: createdAt }] };
      const updateResultPreparing = { rows: [{ item_id: 1, table_num: 1, created_at: createdAt, status: 'preparing' }] };
      const updateResultReady = { rows: [{ item_id: 1, table_num: 1, created_at: createdAt, status: 'ready' }] };
      const updateResultCompleted = { rows: [{ item_id: 1, table_num: 1, created_at: createdAt, status: 'completed' }] };

      // Hazırlanıyor
      poolQueryStub.onCall(0).resolves(checkResult);
      poolQueryStub.onCall(1).resolves(updateResultPreparing);
      let result = await OrderItem.updateStatus(1, 1, createdAt, 'preparing');
      expect(result.status).to.equal('preparing');

      // Hazır
      poolQueryStub.onCall(2).resolves(checkResult);
      poolQueryStub.onCall(3).resolves(updateResultReady);
      result = await OrderItem.updateStatus(1, 1, createdAt, 'ready');
      expect(result.status).to.equal('ready');

      // Tamamlandı
      poolQueryStub.onCall(4).resolves(checkResult);
      poolQueryStub.onCall(5).resolves(updateResultCompleted);
      result = await OrderItem.updateStatus(1, 1, createdAt, 'completed');
      expect(result.status).to.equal('completed');
    });

    it('masa numarasına göre siparişleri getirmelidir', async () => {
      const mockOrders = [{
        item_id: testMenuItem.item_id,
        quantity: 2,
        table_num: 1,
        notes: 'Ekstra acılı',
        status: 'pending',
        created_at: new Date(),
        name: 'Burger',
        price: 10.99
      }];
      poolQueryStub.resolves({ rows: mockOrders });

      const tableOrders = await OrderItem.getOrdersByTable(1);
      expect(tableOrders).to.be.an('array');
      expect(tableOrders.length).to.equal(1);
      const order = tableOrders[0];
      expect(order).to.have.all.keys([
        'item_id',
        'quantity',
        'table_num',
        'notes',
        'status',
        'created_at',
        'name',
        'price'
      ]);
    });

    it('tüm bekleyen siparişleri getirmelidir', async () => {
      const mockOrders = [{
        item_id: testMenuItem.item_id,
        quantity: 2,
        table_num: 1,
        notes: 'Ekstra acılı',
        status: 'pending',
        created_at: new Date(),
        name: 'Burger',
        price: 10.99
      }];
      poolQueryStub.resolves({ rows: mockOrders });

      const pendingOrders = await OrderItem.getAllPendingOrders();
      expect(pendingOrders).to.be.an('array');
      expect(pendingOrders.length).to.equal(1);
      pendingOrders.forEach(order => {
        expect(order.status).to.equal('pending');
      });
    });

    it('tüm aktif siparişleri getirmelidir', async () => {
      const mockOrders = [
        {
          item_id: testMenuItem.item_id,
          quantity: 2,
          table_num: 1,
          notes: 'Ekstra acılı',
          status: 'pending',
          created_at: new Date(),
          name: 'Burger',
          price: 10.99
        },
        {
          item_id: testMenuItem.item_id,
          quantity: 1,
          table_num: 2,
          notes: 'Soğansız',
          status: 'preparing',
          created_at: new Date(),
          name: 'Burger',
          price: 10.99
        }
      ];
      poolQueryStub.resolves({ rows: mockOrders });

      const activeOrders = await OrderItem.getAllOrders();
      expect(activeOrders).to.be.an('array');
      expect(activeOrders.length).to.equal(2);
      activeOrders.forEach(order => {
        expect(['pending', 'preparing', 'ready']).to.include(order.status);
      });
    });

    it('hazır siparişleri masa numarasına göre getirmelidir', async () => {
      const mockOrders = [{
        item_id: testMenuItem.item_id,
        quantity: 2,
        table_num: 1,
        notes: 'Ekstra acılı',
        status: 'ready',
        created_at: new Date(),
        name: 'Burger',
        price: 10.99
      }];
      poolQueryStub.resolves({ rows: mockOrders });

      const readyOrders = await OrderItem.getReadyOrdersByTable();
      expect(readyOrders).to.be.an('array');
      expect(readyOrders.length).to.equal(1);
      readyOrders.forEach(order => {
        expect(order.status).to.equal('ready');
      });
    });
  });
}); 