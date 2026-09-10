import React, { useState, useEffect } from 'react';
import {
  ConfigProvider,
  Layout,
  Menu,
  theme,
  Button,
  Avatar,
  Badge,
  Dropdown,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Alert,
  message,
  Tooltip,
  Tabs,
  Popconfirm,
  QRCode,
  Divider,
} from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  SettingOutlined,
  DatabaseOutlined,
  PlusOutlined,
  ReloadOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  BankOutlined,
  BellOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UserOutlined,
  InboxOutlined,
  AuditOutlined,
  SafetyCertificateOutlined,
  DeleteOutlined,
  BarcodeOutlined,
  GlobalOutlined,
  CheckOutlined,
  DownloadOutlined,
  EyeOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';

import * as api from './services/api';

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function App() {
  const [lang, setLang] = useState('en'); // 'en' | 'ar'
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Live Data States directly from MongoDB
  const [health, setHealth] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [financials, setFinancials] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);

  // Modals
  const [isProductModal, setIsProductModal] = useState(false);
  const [isCustomerModal, setIsCustomerModal] = useState(false);
  const [isSupplierModal, setIsSupplierModal] = useState(false);
  const [isPoModal, setIsPoModal] = useState(false);
  const [isExpenseModal, setIsExpenseModal] = useState(false);
  const [isEmployeeModal, setIsEmployeeModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  // POS State
  const [posCart, setPosCart] = useState([]);
  const [posCustomer, setPosCustomer] = useState('Walk-in Retail Customer');
  const [posPaymentMethod, setPosPaymentMethod] = useState('CASH');

  // Forms
  const [productForm] = Form.useForm();
  const [customerForm] = Form.useForm();
  const [supplierForm] = Form.useForm();
  const [poForm] = Form.useForm();
  const [expenseForm] = Form.useForm();
  const [employeeForm] = Form.useForm();

  // Load all data from real MongoDB
  const refreshAll = async () => {
    setLoading(true);
    try {
      const [
        healthRes,
        prodRes,
        custRes,
        suppRes,
        poRes,
        salesRes,
        accRes,
        expRes,
        finRes,
        empRes,
        payRes,
      ] = await Promise.allSettled([
        api.getHealth(),
        api.getProducts(),
        api.getCustomers(),
        api.getSuppliers(),
        api.getPurchases(),
        api.getSales(),
        api.getAccounts(),
        api.getExpenses(),
        api.getFinancialSummary(),
        api.getEmployees(),
        api.getPayrolls(),
      ]);

      if (healthRes.status === 'fulfilled') setHealth(healthRes.value?.data);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value?.data || []);
      if (custRes.status === 'fulfilled') setCustomers(custRes.value?.data || []);
      if (suppRes.status === 'fulfilled') setSuppliers(suppRes.value?.data || []);
      if (poRes.status === 'fulfilled') setPurchases(poRes.value?.data || []);
      if (salesRes.status === 'fulfilled') setSales(salesRes.value?.data || []);
      if (accRes.status === 'fulfilled') setAccounts(accRes.value?.data || []);
      if (expRes.status === 'fulfilled') setExpenses(expRes.value?.data || []);
      if (finRes.status === 'fulfilled') setFinancials(finRes.value?.data || null);
      if (empRes.status === 'fulfilled') setEmployees(empRes.value?.data || []);
      if (payRes.status === 'fulfilled') setPayrolls(payRes.value?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Handlers for real MongoDB mutations
  const handleCreateProduct = async (values) => {
    try {
      const res = await api.createProduct(values);
      if (res.success) {
        message.success('Product saved directly to MongoDB!');
        setIsProductModal(false);
        productForm.resetFields();
        refreshAll();
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.deleteProduct(id);
      message.success('Product deleted from MongoDB');
      refreshAll();
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    }
  };

  const handleCreateCustomer = async (values) => {
    try {
      const res = await api.createCustomer(values);
      if (res.success) {
        message.success('Customer registered in MongoDB!');
        setIsCustomerModal(false);
        customerForm.resetFields();
        refreshAll();
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    }
  };

  const handleCreateSupplier = async (values) => {
    try {
      const res = await api.createSupplier(values);
      if (res.success) {
        message.success('Supplier registered in MongoDB!');
        setIsSupplierModal(false);
        supplierForm.resetFields();
        refreshAll();
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    }
  };

  const handleCreatePO = async (values) => {
    try {
      const supplier = suppliers.find((s) => s._id === values.supplierId);
      const product = products.find((p) => p._id === values.productId);
      const payload = {
        supplierId: values.supplierId,
        supplierName: supplier?.nameEn || 'Supplier',
        items: [
          {
            productId: product?._id,
            sku: product?.sku || 'SKU',
            name: product?.name || 'Product',
            quantity: values.quantity,
            unitCost: values.unitCost,
            vatRate: 15,
          },
        ],
      };
      const res = await api.createPurchase(payload);
      if (res.success) {
        message.success('Purchase Order created in MongoDB!');
        setIsPoModal(false);
        poForm.resetFields();
        refreshAll();
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    }
  };

  const handleReceiveGoods = async (poId) => {
    try {
      const res = await api.receivePurchaseGoods(poId);
      if (res.success) {
        message.success('Goods received! Inventory stock incremented in MongoDB.');
        refreshAll();
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    }
  };

  const handleCreateExpense = async (values) => {
    try {
      const res = await api.createExpense(values);
      if (res.success) {
        message.success('Expense recorded in MongoDB Ledger!');
        setIsExpenseModal(false);
        expenseForm.resetFields();
        refreshAll();
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    }
  };

  const handleCreateEmployee = async (values) => {
    try {
      const res = await api.createEmployee(values);
      if (res.success) {
        message.success('Employee created with Saudi GOSI calculation!');
        setIsEmployeeModal(false);
        employeeForm.resetFields();
        refreshAll();
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    }
  };

  const handleCalculatePayroll = async () => {
    try {
      const salaryMonth = new Date().toISOString().slice(0, 7);
      const res = await api.calculateMonthlyPayroll(salaryMonth);
      if (res.success) {
        message.success(`Payroll processed successfully for ${salaryMonth}!`);
        refreshAll();
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    }
  };

  const handleDownloadWpsSif = async (payroll) => {
    try {
      message.loading({ content: 'Generating Saudi WPS SIF file...', key: 'wps' });
      await api.downloadWpsSif(payroll._id, payroll.payrollNumber);
      message.success({ content: 'WPS SIF File downloaded successfully!', key: 'wps' });
    } catch (err) {
      message.error({ content: `Failed to download WPS: ${err.message}`, key: 'wps' });
    }
  };

  // POS Add to Cart & Checkout
  const addToPosCart = (product) => {
    if (product.currentStock <= 0) {
      message.warning('Product is Out of Stock!');
      return;
    }
    const exists = posCart.find((item) => item._id === product._id);
    if (exists) {
      if (exists.quantity >= product.currentStock) {
        message.warning('Cannot exceed available stock in warehouse');
        return;
      }
      setPosCart(
        posCart.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setPosCart([
        ...posCart,
        {
          _id: product._id,
          sku: product.sku,
          name: product.name,
          unitPrice: product.retailPrice,
          quantity: 1,
          vatRate: 15,
        },
      ]);
    }
  };

  const handlePosCheckout = async () => {
    if (posCart.length === 0) {
      message.warning('Cart is empty');
      return;
    }
    try {
      const payload = {
        channel: 'POS_RETAIL',
        invoiceType: 'SIMPLIFIED',
        customerName: posCustomer,
        paymentMethod: posPaymentMethod,
        items: posCart.map((item) => ({
          productId: item._id,
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: 15,
        })),
      };
      const res = await api.createSaleInvoice(payload);
      if (res.success) {
        message.success('Sale Completed! Stock deducted & ZATCA QR Generated');
        setSelectedInvoice(res.data);
        setPosCart([]);
        refreshAll();
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message);
    }
  };

  const posSubtotal = posCart.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const posVat = posSubtotal * 0.15;
  const posTotal = posSubtotal + posVat;

  const isMongoConnected = health?.database?.connected;

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: lang === 'en' ? 'Executive Dashboard' : 'لوحة التحكم التنفيذية',
    },
    {
      key: 'pos',
      icon: <ShoppingCartOutlined />,
      label: lang === 'en' ? 'Retail POS & Billing' : 'نقطة البيع والمبيعات',
    },
    {
      key: 'inventory',
      icon: <ShoppingOutlined />,
      label: lang === 'en' ? 'Master Data & Stock' : 'دليل الأصناف والمخزون',
    },
    {
      key: 'procurement',
      icon: <InboxOutlined />,
      label: lang === 'en' ? 'Procurement & POs' : 'المشتريات وأوامر الشراء',
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: lang === 'en' ? 'Customers & VAT TRN' : 'العملاء والضريبة',
    },
    {
      key: 'suppliers',
      icon: <TeamOutlined />,
      label: lang === 'en' ? 'Suppliers & Vendors' : 'الموردين والشركات',
    },
    {
      key: 'accounting',
      icon: <DollarOutlined />,
      label: lang === 'en' ? 'Accounts & 15% VAT' : 'الحسابات وضريبة ١٥٪',
    },
    {
      key: 'hrm',
      icon: <AuditOutlined />,
      label: lang === 'en' ? 'HRM & GOSI Payroll' : 'الموارد البشرية والرواتب',
    },
    {
      key: 'zatca',
      icon: <SafetyCertificateOutlined />,
      label: lang === 'en' ? 'ZATCA E-Invoicing' : 'الفاتورة الإلكترونية (زاتكا)',
    },
  ];

  return (
    <ConfigProvider
      direction={lang === 'ar' ? 'rtl' : 'ltr'}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0f3460',
          colorInfo: '#0f3460',
          colorSuccess: '#059669',
          colorWarning: '#d97706',
          colorError: '#dc2626',
          borderRadius: 8,
          fontFamily:
            lang === 'ar'
              ? "'Cairo', 'Segoe UI', sans-serif"
              : "'Plus Jakarta Sans', sans-serif",
        },
      }}
    >
      <Layout className="erp-layout">
        {/* SIDEBAR NAVIGATION */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{ background: '#071324', borderRight: '1px solid #1e293b' }}
          width={260}
        >
          <div className="erp-logo-container">
            <BankOutlined style={{ fontSize: '24px', color: '#fbbf24' }} />
            {!collapsed && (
              <span className="erp-logo-text" style={{ marginLeft: 10 }}>
                SAUDI <span className="erp-logo-gold">ERP</span>
              </span>
            )}
          </div>

          <Menu
            theme="dark"
            selectedKeys={[activeMenu]}
            mode="inline"
            items={menuItems}
            onClick={({ key }) => setActiveMenu(key)}
            style={{
              background: '#071324',
              marginTop: '12px',
              fontSize: '14px',
              fontWeight: 500,
            }}
          />
        </Sider>

        <Layout>
          {/* HEADER */}
          <Header className="erp-header">
            <Space size="middle">
              <Text strong style={{ fontSize: 16, color: '#071324' }}>
                {lang === 'en'
                  ? 'Saudi Arabia & Dubai Enterprise Resource Planning'
                  : 'نظام تخطيط الموارد المؤسسية للمملكة العربية السعودية'}
              </Text>
              <Tag color="gold" style={{ fontWeight: 700 }}>
                🇸🇦 ZATCA Phase 1 & 2 Compliant
              </Tag>
            </Space>

            <Space size="middle">
              {/* Language Switcher */}
              <Button
                icon={<GlobalOutlined />}
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              >
                {lang === 'en' ? 'العربية (Arabic)' : 'English (LTR)'}
              </Button>

              <Tag
                icon={
                  isMongoConnected ? (
                    <CheckCircleOutlined />
                  ) : (
                    <DatabaseOutlined />
                  )
                }
                color={isMongoConnected ? 'success' : 'processing'}
                style={{ padding: '4px 12px', fontSize: '13px', fontWeight: 600 }}
              >
                MongoDB Live: {isMongoConnected ? 'Active (Real Data)' : 'Connecting...'}
              </Tag>

              <Button
                icon={<ReloadOutlined />}
                onClick={refreshAll}
                loading={loading}
              >
                {lang === 'en' ? 'Sync' : 'تحديث'}
              </Button>

              <Badge count={sales.length} overflowCount={99}>
                <Button shape="circle" icon={<BellOutlined />} />
              </Badge>

              <Avatar style={{ backgroundColor: '#0f3460' }}>SA</Avatar>
            </Space>
          </Header>

          {/* MAIN WORKSPACE CONTENT */}
          <Content style={{ margin: '24px', minHeight: 'calc(100vh - 150px)' }}>
            {/* 1. EXECUTIVE DASHBOARD */}
            {activeMenu === 'dashboard' && (
              <div>
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card-gold" bordered={false}>
                      <Statistic
                        title={lang === 'en' ? 'Total Revenue (SAR)' : 'إجمالي الإيرادات (ريال)'}
                        value={financials?.revenue || 0}
                        precision={2}
                        prefix={<DollarOutlined style={{ color: '#d97706' }} />}
                      />
                      <Text type="secondary">
                        {sales.length} {lang === 'en' ? 'Completed Invoices' : 'فواتير مكتملة'}
                      </Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card-blue" bordered={false}>
                      <Statistic
                        title={lang === 'en' ? 'Master SKU Items' : 'أصناف المخزون المسجلة'}
                        value={products.length}
                        prefix={<ShoppingOutlined style={{ color: '#2563eb' }} />}
                      />
                      <Text type="secondary">
                        {lang === 'en' ? 'Stored in MongoDB' : 'مخزنة في قاعدة البيانات'}
                      </Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card-green" bordered={false}>
                      <Statistic
                        title={lang === 'en' ? 'Net Profit (SAR)' : 'صافي الأرباح (ريال)'}
                        value={financials?.netProfit || 0}
                        precision={2}
                        prefix={<CheckCircleOutlined style={{ color: '#059669' }} />}
                      />
                      <Text type="secondary">
                        {lang === 'en' ? 'Revenue - COGS - Expenses' : 'الإيرادات - التكلفة - المصروفات'}
                      </Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card-purple" bordered={false}>
                      <Statistic
                        title={lang === 'en' ? 'ZATCA Output VAT 15%' : 'ضريبة المبيعات المستحقة'}
                        value={financials?.vat?.outputVatCollected || 0}
                        precision={2}
                        prefix={<SafetyCertificateOutlined style={{ color: '#7c3aed' }} />}
                      />
                      <Text type="secondary">
                        {lang === 'en' ? 'Payable to Tax Authority' : 'مستحق لهيئة الزكاة والضريبة'}
                      </Text>
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={16}>
                    <Card
                      title={lang === 'en' ? 'Recent Sales Invoices' : 'أحدث فواتير المبيعات'}
                      extra={
                        <Button type="primary" onClick={() => setActiveMenu('pos')}>
                          {lang === 'en' ? 'Open POS Register' : 'فتح نقطة البيع'}
                        </Button>
                      }
                    >
                      <Table
                        dataSource={sales}
                        rowKey="_id"
                        pagination={{ pageSize: 4 }}
                        columns={[
                          { title: 'Invoice #', dataIndex: 'invoiceNumber', key: 'inv' },
                          { title: 'Customer', dataIndex: 'customerName', key: 'cust' },
                          {
                            title: 'Total (SAR)',
                            dataIndex: 'totalAmount',
                            key: 'tot',
                            render: (v) => <Text strong>SAR {v.toFixed(2)}</Text>,
                          },
                          {
                            title: 'VAT (15%)',
                            dataIndex: 'totalVat',
                            key: 'vat',
                            render: (v) => `SAR ${v.toFixed(2)}`,
                          },
                          {
                            title: 'ZATCA Status',
                            dataIndex: 'zatcaStatus',
                            key: 'status',
                            render: (s) => (
                              <Tag color={s === 'REPORTED' ? 'green' : 'blue'}>
                                {s}
                              </Tag>
                            ),
                          },
                          {
                            title: 'Action',
                            key: 'act',
                            render: (_, row) => (
                              <Button
                                size="small"
                                icon={<BarcodeOutlined />}
                                onClick={() => setSelectedInvoice(row)}
                              >
                                View ZATCA QR
                              </Button>
                            ),
                          },
                        ]}
                      />
                    </Card>
                  </Col>

                  <Col xs={24} lg={8}>
                    <Card title={lang === 'en' ? 'Low Stock Alerts' : 'تنبيهات انخفاض المخزون'}>
                      {products
                        .filter((p) => p.currentStock <= (p.reorderLevel || 5))
                        .map((item) => (
                          <div
                            key={item._id}
                            style={{
                              padding: '10px 0',
                              borderBottom: '1px solid #f1f5f9',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <Text strong>{item.name}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                SKU: {item.sku}
                              </Text>
                            </div>
                            <Tag color="red">{item.currentStock} left</Tag>
                          </div>
                        ))}
                      {products.filter((p) => p.currentStock <= (p.reorderLevel || 5)).length === 0 && (
                        <Alert
                          message="All items are sufficiently stocked"
                          type="success"
                          showIcon
                        />
                      )}
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {/* 2. RETAIL POS & BILLING */}
            {activeMenu === 'pos' && (
              <Row gutter={16}>
                {/* Product Grid */}
                <Col xs={24} lg={15}>
                  <Card title={lang === 'en' ? 'Product Catalog' : 'دليل المنتجات السريعة'}>
                    <Row gutter={[12, 12]}>
                      {products.map((item) => (
                        <Col xs={24} sm={12} md={8} key={item._id}>
                          <Card
                            hoverable
                            style={{
                              borderColor: item.currentStock === 0 ? '#fca5a5' : '#e2e8f0',
                            }}
                            onClick={() => addToPosCart(item)}
                          >
                            <Text strong style={{ color: '#0f3460' }}>
                              {lang === 'ar' && item.nameArabic ? item.nameArabic : item.name}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              SKU: {item.sku}
                            </Text>
                            <div
                              style={{
                                marginTop: 10,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Text strong style={{ color: '#059669' }}>
                                SAR {item.retailPrice.toFixed(2)}
                              </Text>
                              <Tag color={item.currentStock > 5 ? 'green' : 'orange'}>
                                Stock: {item.currentStock}
                              </Tag>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                </Col>

                {/* POS Cart & Checkout */}
                <Col xs={24} lg={9}>
                  <Card
                    title={
                      <Space>
                        <ShoppingCartOutlined />
                        <span>{lang === 'en' ? 'POS Current Bill' : 'فاتورة نقطة البيع'}</span>
                      </Space>
                    }
                  >
                    <div style={{ marginBottom: 12 }}>
                      <Text strong>Customer:</Text>
                      <Input
                        value={posCustomer}
                        onChange={(e) => setPosCustomer(e.target.value)}
                        placeholder="Customer Name"
                        style={{ marginTop: 4 }}
                      />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <Text strong>Payment Mode:</Text>
                      <Select
                        value={posPaymentMethod}
                        onChange={setPosPaymentMethod}
                        style={{ width: '100%', marginTop: 4 }}
                      >
                        <Select.Option value="CASH">Cash (نقد)</Select.Option>
                        <Select.Option value="MADA">Mada Debit Card (مدى)</Select.Option>
                        <Select.Option value="CREDIT_CARD">Credit Card (بطاقة ائتمان)</Select.Option>
                        <Select.Option value="CREDIT_ACCOUNT">Credit Account (آجل)</Select.Option>
                      </Select>
                    </div>

                    <Table
                      dataSource={posCart}
                      rowKey="_id"
                      pagination={false}
                      size="small"
                      columns={[
                        { title: 'Item', dataIndex: 'name', key: 'name' },
                        { title: 'Qty', dataIndex: 'quantity', key: 'qty' },
                        {
                          title: 'Total',
                          key: 'tot',
                          render: (_, row) =>
                            `SAR ${(row.quantity * row.unitPrice).toFixed(2)}`,
                        },
                        {
                          title: '',
                          key: 'del',
                          render: (_, row) => (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() =>
                                setPosCart(posCart.filter((i) => i._id !== row._id))
                              }
                            />
                          ),
                        },
                      ]}
                    />

                    <Divider style={{ margin: '16px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text>Subtotal (Excl. VAT):</Text>
                      <Text strong>SAR {posSubtotal.toFixed(2)}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text>ZATCA VAT (15%):</Text>
                      <Text strong style={{ color: '#d97706' }}>
                        SAR {posVat.toFixed(2)}
                      </Text>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: '2px dashed #e2e8f0',
                      }}
                    >
                      <Title level={4} style={{ margin: 0 }}>
                        Total Amount:
                      </Title>
                      <Title level={4} style={{ margin: 0, color: '#059669' }}>
                        SAR {posTotal.toFixed(2)}
                      </Title>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<CheckOutlined />}
                      style={{ marginTop: 20, background: '#0f3460', height: 48 }}
                      onClick={handlePosCheckout}
                    >
                      {lang === 'en' ? 'Complete Sale & Issue ZATCA Invoice' : 'إتمام البيع وإصدار الفاتورة'}
                    </Button>
                  </Card>
                </Col>
              </Row>
            )}

            {/* 3. MASTER DATA & INVENTORY */}
            {activeMenu === 'inventory' && (
              <Card
                title={
                  <Space>
                    <AppstoreOutlined />
                    <span>{lang === 'en' ? 'Product Master Catalog' : 'دليل الأصناف والمخزون'}</span>
                  </Space>
                }
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsProductModal(true)}
                  >
                    {lang === 'en' ? 'Add Item' : 'إضافة صنف'}
                  </Button>
                }
              >
                <Table
                  dataSource={products}
                  rowKey="_id"
                  columns={[
                    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (t) => <Text code strong>{t}</Text> },
                    { title: 'English Name', dataIndex: 'name', key: 'name' },
                    { title: 'Arabic Name (الاسم)', dataIndex: 'nameArabic', key: 'nameAr' },
                    { title: 'Category', dataIndex: 'category', key: 'cat', render: (c) => <Tag color="blue">{c}</Tag> },
                    {
                      title: 'Cost (SAR)',
                      dataIndex: 'costPrice',
                      key: 'cost',
                      render: (v) => `SAR ${Number(v).toFixed(2)}`,
                    },
                    {
                      title: 'Retail Price (SAR)',
                      dataIndex: 'retailPrice',
                      key: 'ret',
                      render: (v) => <Text strong style={{ color: '#059669' }}>SAR {Number(v).toFixed(2)}</Text>,
                    },
                    {
                      title: 'Stock Level',
                      dataIndex: 'currentStock',
                      key: 'stock',
                      render: (v, row) => (
                        <Tag color={v <= (row.reorderLevel || 5) ? 'red' : 'green'}>
                          {v} {row.unit || 'PCS'}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Actions',
                      key: 'act',
                      render: (_, row) => (
                        <Popconfirm
                          title="Delete this product from MongoDB?"
                          onConfirm={() => handleDeleteProduct(row._id)}
                        >
                          <Button danger size="small" icon={<DeleteOutlined />} />
                        </Popconfirm>
                      ),
                    },
                  ]}
                />
              </Card>
            )}

            {/* 4. PROCUREMENT & PURCHASE ORDERS */}
            {activeMenu === 'procurement' && (
              <Card
                title={
                  <Space>
                    <InboxOutlined />
                    <span>{lang === 'en' ? 'Procurement & Purchase Orders' : 'المشتريات وأوامر الشراء'}</span>
                  </Space>
                }
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsPoModal(true)}
                  >
                    {lang === 'en' ? 'New Purchase Order' : 'أمر شراء جديد'}
                  </Button>
                }
              >
                <Table
                  dataSource={purchases}
                  rowKey="_id"
                  columns={[
                    { title: 'PO Number', dataIndex: 'poNumber', key: 'po' },
                    { title: 'Supplier Name', dataIndex: 'supplierName', key: 'supp' },
                    {
                      title: 'Total Amount (SAR)',
                      dataIndex: 'totalAmount',
                      key: 'amt',
                      render: (v) => <Text strong>SAR {Number(v).toFixed(2)}</Text>,
                    },
                    {
                      title: 'VAT 15%',
                      dataIndex: 'totalVat',
                      key: 'vat',
                      render: (v) => `SAR ${Number(v).toFixed(2)}`,
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'stat',
                      render: (s) => (
                        <Tag color={s === 'RECEIVED' ? 'green' : 'orange'}>{s}</Tag>
                      ),
                    },
                    {
                      title: 'Receive Goods',
                      key: 'recv',
                      render: (_, row) =>
                        row.status !== 'RECEIVED' && (
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleReceiveGoods(row._id)}
                          >
                            Receive & Update Stock
                          </Button>
                        ),
                    },
                  ]}
                />
              </Card>
            )}

            {/* 5. CUSTOMERS */}
            {activeMenu === 'customers' && (
              <Card
                title={
                  <Space>
                    <UserOutlined />
                    <span>{lang === 'en' ? 'Customer Profiles & VAT Numbers' : 'دليل العملاء والأرقام الضريبية'}</span>
                  </Space>
                }
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCustomerModal(true)}
                  >
                    {lang === 'en' ? 'Add Customer' : 'إضافة عميل'}
                  </Button>
                }
              >
                <Table
                  dataSource={customers}
                  rowKey="_id"
                  columns={[
                    { title: 'Code', dataIndex: 'code', key: 'code' },
                    { title: 'Name (EN)', dataIndex: 'nameEn', key: 'nen' },
                    { title: 'Name (AR)', dataIndex: 'nameAr', key: 'nar' },
                    { title: 'Type', dataIndex: 'customerType', key: 'typ' },
                    {
                      title: 'ZATCA VAT TRN',
                      dataIndex: 'vatNumber',
                      key: 'trn',
                      render: (v) => <Text code>{v || 'N/A'}</Text>,
                    },
                    { title: 'Phone', dataIndex: 'phone', key: 'ph' },
                    {
                      title: 'Outstanding Balance (SAR)',
                      dataIndex: 'currentBalance',
                      key: 'bal',
                      render: (v) => <Text strong style={{ color: v > 0 ? '#dc2626' : '#059669' }}>SAR {Number(v || 0).toFixed(2)}</Text>,
                    },
                  ]}
                />
              </Card>
            )}

            {/* 6. SUPPLIERS */}
            {activeMenu === 'suppliers' && (
              <Card
                title={
                  <Space>
                    <TeamOutlined />
                    <span>{lang === 'en' ? 'Suppliers & Vendor Accounts' : 'الموردين والشركات'}</span>
                  </Space>
                }
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsSupplierModal(true)}
                  >
                    {lang === 'en' ? 'Add Supplier' : 'إضافة مورد'}
                  </Button>
                }
              >
                <Table
                  dataSource={suppliers}
                  rowKey="_id"
                  columns={[
                    { title: 'Code', dataIndex: 'code', key: 'code' },
                    { title: 'Company Name (EN)', dataIndex: 'nameEn', key: 'nen' },
                    { title: 'Company Name (AR)', dataIndex: 'nameAr', key: 'nar' },
                    { title: 'VAT Number', dataIndex: 'vatNumber', key: 'trn', render: (v) => <Text code>{v || 'N/A'}</Text> },
                    { title: 'Phone', dataIndex: 'phone', key: 'ph' },
                    { title: 'Payment Terms', dataIndex: 'paymentTerms', key: 'pt' },
                    {
                      title: 'Payable Balance (SAR)',
                      dataIndex: 'currentPayable',
                      key: 'pay',
                      render: (v) => <Text strong style={{ color: '#dc2626' }}>SAR {Number(v || 0).toFixed(2)}</Text>,
                    },
                  ]}
                />
              </Card>
            )}

            {/* 7. ACCOUNTING & 15% VAT */}
            {activeMenu === 'accounting' && (
              <div>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col xs={24} md={8}>
                    <Card className="stat-card-blue">
                      <Statistic
                        title="Total Sales (Excl. VAT)"
                        value={financials?.revenue || 0}
                        precision={2}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card className="stat-card-gold">
                      <Statistic
                        title="ZATCA 15% VAT Output Collected"
                        value={financials?.vat?.outputVatCollected || 0}
                        precision={2}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card className="stat-card-green">
                      <Statistic
                        title="Net Operating Profit"
                        value={financials?.netProfit || 0}
                        precision={2}
                      />
                    </Card>
                  </Col>
                </Row>

                <Card
                  title={lang === 'en' ? 'Chart of Accounts (COA)' : 'شجرة الحسابات العامة'}
                  style={{ marginBottom: 24 }}
                >
                  <Table
                    dataSource={accounts}
                    rowKey="_id"
                    columns={[
                      { title: 'Code', dataIndex: 'code', key: 'c', render: (t) => <Text code strong>{t}</Text> },
                      { title: 'Account Name (EN)', dataIndex: 'nameEn', key: 'nen' },
                      { title: 'Account Name (AR)', dataIndex: 'nameAr', key: 'nar' },
                      { title: 'Type', dataIndex: 'type', key: 'typ', render: (t) => <Tag color="blue">{t}</Tag> },
                      {
                        title: 'Balance (SAR)',
                        dataIndex: 'balance',
                        key: 'bal',
                        render: (v) => <Text strong>SAR {Number(v).toLocaleString()}</Text>,
                      },
                    ]}
                  />
                </Card>

                <Card
                  title={lang === 'en' ? 'Operational Expenses' : 'المصروفات التشغيلية'}
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setIsExpenseModal(true)}
                    >
                      Record Expense
                    </Button>
                  }
                >
                  <Table
                    dataSource={expenses}
                    rowKey="_id"
                    columns={[
                      { title: 'Expense #', dataIndex: 'expenseNumber', key: 'no' },
                      { title: 'Category', dataIndex: 'category', key: 'cat' },
                      { title: 'Amount', dataIndex: 'amount', key: 'amt', render: (v) => `SAR ${Number(v).toFixed(2)}` },
                      { title: 'VAT 15%', dataIndex: 'vatAmount', key: 'vat', render: (v) => `SAR ${Number(v).toFixed(2)}` },
                      { title: 'Total', dataIndex: 'total', key: 'tot', render: (v) => <Text strong>SAR {Number(v).toFixed(2)}</Text> },
                      { title: 'Payment Method', dataIndex: 'paymentMethod', key: 'pm' },
                    ]}
                  />
                </Card>
              </div>
            )}

            {/* 8. HRM & GOSI PAYROLL */}
            {activeMenu === 'hrm' && (
              <div>
                {/* Payroll Runs & WPS SIF Generator */}
                <Card
                  title={
                    <Space>
                      <AuditOutlined style={{ color: '#059669' }} />
                      <span>{lang === 'en' ? 'Monthly Payroll Runs & Saudi WPS File Generator' : 'مسيرات الرواتب الشهرية ونظام حماية الأجور (WPS)'}</span>
                    </Space>
                  }
                  extra={
                    <Button
                      type="primary"
                      icon={<CalculatorOutlined />}
                      style={{ background: '#059669', borderColor: '#059669' }}
                      onClick={handleCalculatePayroll}
                    >
                      {lang === 'en' ? 'Calculate Monthly Payroll' : 'احتساب رواتب الشهر'}
                    </Button>
                  }
                  style={{ marginBottom: 24 }}
                >
                  <Table
                    dataSource={payrolls}
                    rowKey="_id"
                    pagination={{ pageSize: 5 }}
                    columns={[
                      {
                        title: 'Payroll #',
                        dataIndex: 'payrollNumber',
                        key: 'pno',
                        render: (t) => <Text strong code style={{ color: '#1890ff' }}>{t}</Text>,
                      },
                      {
                        title: 'Salary Month',
                        dataIndex: 'salaryMonth',
                        key: 'month',
                        render: (m) => <Text strong>{m}</Text>,
                      },
                      {
                        title: 'Staff Count',
                        dataIndex: 'staffCount',
                        key: 'staff',
                        render: (c) => <Tag color="purple">{c} Staff</Tag>,
                      },
                      {
                        title: 'Gross Salary (SAR)',
                        dataIndex: 'grossSalary',
                        key: 'gross',
                        render: (v) => <Text strong>SAR {Number(v).toFixed(2)}</Text>,
                      },
                      {
                        title: 'GOSI Deductions',
                        dataIndex: 'gosiDeductions',
                        key: 'ded',
                        render: (v) => <Text style={{ color: '#dc2626' }}>- SAR {Number(v).toFixed(2)}</Text>,
                      },
                      {
                        title: 'Net Salary Payable (SAR)',
                        dataIndex: 'netSalaryPayable',
                        key: 'net',
                        render: (v) => <Text strong style={{ color: '#059669' }}>SAR {Number(v).toFixed(2)}</Text>,
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: (s) => <Tag color="green">{s || 'PAID'}</Tag>,
                      },
                      {
                        title: 'Actions',
                        key: 'act',
                        render: (_, row) => (
                          <Space>
                            <Button
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => setSelectedPayroll(row)}
                            >
                              {lang === 'en' ? 'Payslips' : 'قسائم الرواتب'}
                            </Button>
                            <Button
                              type="primary"
                              size="small"
                              icon={<DownloadOutlined />}
                              style={{ background: '#0f3460', borderColor: '#0f3460' }}
                              onClick={() => handleDownloadWpsSif(row)}
                            >
                              WPS SIF
                            </Button>
                          </Space>
                        ),
                      },
                    ]}
                  />
                </Card>

                {/* Employees Master List */}
                <Card
                  title={
                    <Space>
                      <TeamOutlined />
                      <span>{lang === 'en' ? 'Employees Master Records' : 'سجل الموظفين والكادر'}</span>
                    </Space>
                  }
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setIsEmployeeModal(true)}
                    >
                      {lang === 'en' ? 'Add Employee' : 'إضافة موظف'}
                    </Button>
                  }
                >
                  <Table
                    dataSource={employees}
                    rowKey="_id"
                    columns={[
                      { title: 'Emp Code', dataIndex: 'employeeCode', key: 'code' },
                      { title: 'Name (EN)', dataIndex: 'nameEn', key: 'nen' },
                      { title: 'Name (AR)', dataIndex: 'nameAr', key: 'nar' },
                      { title: 'National / Iqama ID', dataIndex: 'nationalIdOrIqama', key: 'iqama' },
                      { title: 'Department', dataIndex: 'department', key: 'dept' },
                      {
                        title: 'Basic Salary',
                        dataIndex: 'basicSalary',
                        key: 'bs',
                        render: (v) => `SAR ${Number(v).toFixed(2)}`,
                      },
                      {
                        title: 'GOSI Deduction (9.75%)',
                        dataIndex: 'gosiDeduction',
                        key: 'gosi',
                        render: (v) => <Text style={{ color: '#dc2626' }}>-SAR {Number(v).toFixed(2)}</Text>,
                      },
                      {
                        title: 'Total Salary',
                        dataIndex: 'totalSalary',
                        key: 'tot',
                        render: (v) => <Text strong style={{ color: '#059669' }}>SAR {Number(v).toFixed(2)}</Text>,
                      },
                    ]}
                  />
                </Card>
              </div>
            )}

            {/* 9. ZATCA E-INVOICING HUB */}
            {activeMenu === 'zatca' && (
              <Card
                title={
                  <Space>
                    <SafetyCertificateOutlined style={{ color: '#059669' }} />
                    <span>{lang === 'en' ? 'ZATCA (FATOORA) E-Invoices' : 'منظومة الفوترة الإلكترونية (زاتكا)'}</span>
                  </Space>
                }
              >
                <Table
                  dataSource={sales}
                  rowKey="_id"
                  columns={[
                    { title: 'Invoice Number', dataIndex: 'invoiceNumber', key: 'inv', render: (t) => <Text code strong>{t}</Text> },
                    { title: 'Invoice Type', dataIndex: 'invoiceType', key: 'typ', render: (t) => <Tag color="cyan">{t}</Tag> },
                    { title: 'Customer', dataIndex: 'customerName', key: 'cust' },
                    { title: 'Amount (SAR)', dataIndex: 'totalAmount', key: 'tot', render: (v) => `SAR ${Number(v).toFixed(2)}` },
                    { title: 'VAT 15% (SAR)', dataIndex: 'totalVat', key: 'vat', render: (v) => `SAR ${Number(v).toFixed(2)}` },
                    {
                      title: 'Compliance Status',
                      dataIndex: 'zatcaStatus',
                      key: 'zs',
                      render: (s) => <Tag color="green">{s}</Tag>,
                    },
                    {
                      title: 'QR Code & TLV',
                      key: 'qr',
                      render: (_, row) => (
                        <Button
                          type="primary"
                          size="small"
                          icon={<BarcodeOutlined />}
                          onClick={() => setSelectedInvoice(row)}
                        >
                          View ZATCA QR
                        </Button>
                      ),
                    },
                  ]}
                />
              </Card>
            )}
          </Content>

          <Footer style={{ textAlign: 'center', color: '#64748b' }}>
            SAUDI ARABIA & DUBAI ERP SYSTEM © {new Date().getFullYear()} — Real MongoDB Engine & ZATCA E-Invoicing
          </Footer>
        </Layout>
      </Layout>

      {/* MODAL: ADD PRODUCT */}
      <Modal
        title="Add Master Product to MongoDB"
        open={isProductModal}
        onCancel={() => setIsProductModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={productForm} layout="vertical" onFinish={handleCreateProduct}>
          <Form.Item name="name" label="English Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Royal Ajwa Dates 1kg" />
          </Form.Item>
          <Form.Item name="nameArabic" label="Arabic Name (الاسم بالعربي)">
            <Input placeholder="مثال: تمر عجوة ملكي ١ كجم" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sku" label="SKU / Barcode" rules={[{ required: true }]}>
                <Input placeholder="KSA-PROD-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="Category" initialValue="General">
                <Select>
                  <Select.Option value="Food & Gourmet">Food & Gourmet</Select.Option>
                  <Select.Option value="Beverages">Beverages</Select.Option>
                  <Select.Option value="Perfumes & Oud">Perfumes & Oud</Select.Option>
                  <Select.Option value="Construction Materials">Construction Materials</Select.Option>
                  <Select.Option value="Electronics">Electronics</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="costPrice" label="Cost (SAR)" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="retailPrice" label="Retail (SAR)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="currentStock" label="Initial Stock" initialValue={10}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" block style={{ marginTop: 10 }}>
            Save Product Directly to MongoDB
          </Button>
        </Form>
      </Modal>

      {/* MODAL: ADD CUSTOMER */}
      <Modal
        title="Add Customer with ZATCA VAT TRN"
        open={isCustomerModal}
        onCancel={() => setIsCustomerModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={customerForm} layout="vertical" onFinish={handleCreateCustomer}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label="Customer Code" rules={[{ required: true }]}>
                <Input placeholder="CUST-002" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerType" label="Type" initialValue="WHOLESALE">
                <Select>
                  <Select.Option value="RETAIL">Retail</Select.Option>
                  <Select.Option value="WHOLESALE">Wholesale</Select.Option>
                  <Select.Option value="CORPORATE">Corporate</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="nameEn" label="English Name / Company" rules={[{ required: true }]}>
            <Input placeholder="Al-Riyadh Logistics Group" />
          </Form.Item>
          <Form.Item name="nameAr" label="Arabic Name (اسم العميل)">
            <Input placeholder="مجموعة الرياض للخدمات اللوجستية" />
          </Form.Item>
          <Form.Item name="vatNumber" label="15-digit ZATCA VAT Number">
            <Input placeholder="310123456700003" />
          </Form.Item>
          <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
            <Input placeholder="+966501234567" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Save Customer to MongoDB
          </Button>
        </Form>
      </Modal>

      {/* MODAL: ADD SUPPLIER */}
      <Modal
        title="Register Supplier Profile"
        open={isSupplierModal}
        onCancel={() => setIsSupplierModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={supplierForm} layout="vertical" onFinish={handleCreateSupplier}>
          <Form.Item name="code" label="Supplier Code" rules={[{ required: true }]}>
            <Input placeholder="SUPP-002" />
          </Form.Item>
          <Form.Item name="nameEn" label="Supplier Name (EN)" rules={[{ required: true }]}>
            <Input placeholder="Saudi Gulf Packaging Supplies" />
          </Form.Item>
          <Form.Item name="nameAr" label="Supplier Name (AR)">
            <Input placeholder="شركة التغليف الخليجية السعودية" />
          </Form.Item>
          <Form.Item name="vatNumber" label="VAT Number">
            <Input placeholder="310999888700003" />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input placeholder="+966114561234" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Save Supplier to MongoDB
          </Button>
        </Form>
      </Modal>

      {/* MODAL: CREATE PO */}
      <Modal
        title="Create Purchase Order"
        open={isPoModal}
        onCancel={() => setIsPoModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={poForm} layout="vertical" onFinish={handleCreatePO}>
          <Form.Item name="supplierId" label="Select Supplier" rules={[{ required: true }]}>
            <Select placeholder="Choose supplier">
              {suppliers.map((s) => (
                <Select.Option key={s._id} value={s._id}>
                  {s.nameEn}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="productId" label="Select Product" rules={[{ required: true }]}>
            <Select placeholder="Choose product to order">
              {products.map((p) => (
                <Select.Option key={p._id} value={p._id}>
                  {p.name} (SKU: {p.sku})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="quantity" label="Order Quantity" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unitCost" label="Unit Cost (SAR)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" block>
            Generate Purchase Order
          </Button>
        </Form>
      </Modal>

      {/* MODAL: RECORD EXPENSE */}
      <Modal
        title="Record Operational Expense"
        open={isExpenseModal}
        onCancel={() => setIsExpenseModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={expenseForm} layout="vertical" onFinish={handleCreateExpense}>
          <Form.Item name="category" label="Expense Category" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Shop Rent">Shop & Warehouse Rent</Select.Option>
              <Select.Option value="Utilities & Electricity">Utilities (SEC Electricity/Water)</Select.Option>
              <Select.Option value="Logistics & Delivery">Logistics & Transportation</Select.Option>
              <Select.Option value="Office Supplies">Office & IT Supplies</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="amount" label="Amount (Excl. VAT)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="paidTo" label="Paid To / Vendor">
            <Input placeholder="Saudi Electricity Company" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Record in Ledger
          </Button>
        </Form>
      </Modal>

      {/* MODAL: ADD EMPLOYEE */}
      <Modal
        title="Register Employee (Saudi GOSI Ready)"
        open={isEmployeeModal}
        onCancel={() => setIsEmployeeModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={employeeForm} layout="vertical" onFinish={handleCreateEmployee}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="employeeCode" label="Employee ID" rules={[{ required: true }]}>
                <Input placeholder="EMP-003" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nationalIdOrIqama" label="Iqama / National ID" rules={[{ required: true }]}>
                <Input placeholder="1023456789" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="nameEn" label="Full Name (EN)" rules={[{ required: true }]}>
            <Input placeholder="Khalid Al-Mansoor" />
          </Form.Item>
          <Form.Item name="nameAr" label="Full Name (AR)">
            <Input placeholder="خالد المنصور" />
          </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true }]}>
            <Input placeholder="Warehouse & Distribution" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="basicSalary" label="Basic Salary (SAR)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="housingAllowance" label="Housing Allowance" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" block>
            Save Employee
          </Button>
        </Form>
      </Modal>

      {/* MODAL: ZATCA QR CODE VIEWER */}
      <Modal
        title="ZATCA Compliant E-Invoice & TLV QR Code"
        open={!!selectedInvoice}
        onCancel={() => setSelectedInvoice(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedInvoice(null)}>
            Done
          </Button>,
        ]}
      >
        {selectedInvoice && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <QRCode
              value={selectedInvoice.zatcaQrCode || 'ZATCA-SAMPLE'}
              size={200}
              style={{ margin: '0 auto 16px auto' }}
            />
            <Title level={4} style={{ margin: 0 }}>
              {selectedInvoice.invoiceNumber}
            </Title>
            <Text type="secondary">ZATCA Base64 TLV Encoding Verified</Text>
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ textAlign: 'left', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
              <p><strong>Customer:</strong> {selectedInvoice.customerName}</p>
              <p><strong>Subtotal:</strong> SAR {Number(selectedInvoice.subtotal).toFixed(2)}</p>
              <p><strong>VAT 15%:</strong> SAR {Number(selectedInvoice.totalVat).toFixed(2)}</p>
              <p><strong>Total Amount:</strong> SAR {Number(selectedInvoice.totalAmount).toFixed(2)}</p>
              <p><strong>Payment Method:</strong> {selectedInvoice.paymentMethod}</p>
              <p><strong>ZATCA Status:</strong> <Tag color="green">{selectedInvoice.zatcaStatus}</Tag></p>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: PAYSLIPS VIEWER */}
      <Modal
        title={`Payslips Breakdown — ${selectedPayroll?.payrollNumber || ''}`}
        open={!!selectedPayroll}
        onCancel={() => setSelectedPayroll(null)}
        width={750}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedPayroll(null)}>
            Close
          </Button>,
        ]}
      >
        {selectedPayroll && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <Text strong>Salary Month: </Text>
                <Tag color="blue">{selectedPayroll.salaryMonth}</Tag>
              </div>
              <div>
                <Text strong>Total Disbursed: </Text>
                <Text strong style={{ color: '#059669' }}>
                  SAR {Number(selectedPayroll.netSalaryPayable).toFixed(2)}
                </Text>
              </div>
            </div>
            <Table
              dataSource={selectedPayroll.records || []}
              rowKey="employeeId"
              pagination={false}
              size="small"
              columns={[
                { title: 'Emp Code', dataIndex: 'employeeCode', key: 'c' },
                { title: 'Employee Name', dataIndex: 'name', key: 'n' },
                { title: 'IBAN', dataIndex: 'iban', key: 'ib', render: (t) => <Text code>{t}</Text> },
                {
                  title: 'Basic',
                  dataIndex: 'basicSalary',
                  key: 'bs',
                  render: (v) => `SAR ${Number(v).toFixed(2)}`,
                },
                {
                  title: 'GOSI Ded.',
                  dataIndex: 'deductions',
                  key: 'd',
                  render: (v) => <Text style={{ color: '#dc2626' }}>-SAR ${Number(v).toFixed(2)}</Text>,
                },
                {
                  title: 'Net Salary',
                  dataIndex: 'netSalary',
                  key: 'net',
                  render: (v) => <Text strong style={{ color: '#059669' }}>SAR {Number(v).toFixed(2)}</Text>,
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </ConfigProvider>
  );
}
