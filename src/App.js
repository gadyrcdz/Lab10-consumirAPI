import React, { useState, useEffect } from 'react';
import './App.css';
import { API_CONFIG } from './config';

function App() {
  // Estados principales
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de controles
  const [format, setFormat] = useState('application/json');
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('name:asc');
  
  // Estado del modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [productDetail, setProductDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Función para obtener productos
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        
        `${API_CONFIG.baseURL}/api/products?page=${currentPage}&limit=${pageSize}`,
        {
          headers: {
            'x-api-key': API_CONFIG.apiKey,
            'Accept': format
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      let data;
      if (format === 'application/json') {
        data = await response.json();
      } else {
        const text = await response.text();
        data = parseXMLProducts(text);
      }

      setProducts(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para parsear XML
  const parseXMLProducts = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    const productNodes = xmlDoc.getElementsByTagName('product');
    const products = [];
    
    for (let node of productNodes) {
      products.push({
        id: node.getElementsByTagName('id')[0]?.textContent,
        name: node.getElementsByTagName('name')[0]?.textContent,
        sku: node.getElementsByTagName('sku')[0]?.textContent,
        price: node.getElementsByTagName('price')[0]?.textContent,
        category: node.getElementsByTagName('category')[0]?.textContent,
        description: node.getElementsByTagName('description')[0]?.textContent,
      });
    }
    
    return {
      data: products,
      totalPages: parseInt(xmlDoc.getElementsByTagName('totalPages')[0]?.textContent || '1')
    };
  };

  // Función para obtener detalle del producto
  const fetchProductDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const response = await fetch(
        `${API_CONFIG.baseURL}/api/products/${id}`,
        {
          headers: {
            'x-api-key': API_CONFIG.apiKey,
            'Accept': format
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener detalle');
      }

      const text = await response.text();
      setProductDetail(text);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Efecto para cargar productos
  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, format]);

  // Función para ordenar productos
  const getSortedProducts = () => {
    const [field, order] = sortBy.split(':');
    const sorted = [...products].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      if (field === 'price') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else {
        aVal = (aVal || '').toString().toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
      }
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return sorted;
  };

  // Manejadores de eventos
  const handleFormatChange = (e) => {
    setFormat(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowRaw(false);
    fetchProductDetail(product.id);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setProductDetail(null);
    setShowRaw(false);
  };

  return (
    <div className="App">
      <div className="header">
        <h1>🛍️ Catálogo de Productos</h1>
        
        <div className="controls">
          <div className="control-group">
            <label>Formato:</label>
            <select value={format} onChange={handleFormatChange}>
              <option value="application/json">JSON</option>
              <option value="application/xml">XML</option>
            </select>
          </div>

          <div className="control-group">
            <label>Productos por página:</label>
            <select value={pageSize} onChange={handlePageSizeChange}>
              <option value="6">6</option>
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
          </div>

          <div className="control-group">
            <label>Ordenar por:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name:asc">Nombre (A-Z)</option>
              <option value="name:desc">Nombre (Z-A)</option>
              <option value="price:asc">Precio (Menor a Mayor)</option>
              <option value="price:desc">Precio (Mayor a Menor)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="products-grid">
          {[...Array(pageSize)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-state" role="alert">
          <h2>⚠️ Error al cargar productos</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchProducts}>
            Reintentar
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <h2>📦 No hay productos para mostrar</h2>
          <p>Intenta ajustar los filtros o vuelve más tarde</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="products-grid">
            {getSortedProducts().map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => handleProductClick(product)}
              >
                <h3>{product.name}</h3>
                <span className="sku">SKU: {product.sku}</span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Página {currentPage} de {totalPages}
            </div>
            <div className="pagination-buttons">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                ← Anterior
              </button>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= totalPages}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de detalle */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProduct.name}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
              
              <div className="modal-tabs">
                <button
                  className={`tab-button ${!showRaw ? 'active' : ''}`}
                  onClick={() => setShowRaw(false)}
                >
                  📋 Detalle
                </button>
                <button
                  className={`tab-button ${showRaw ? 'active' : ''}`}
                  onClick={() => setShowRaw(true)}
                >
                  💻 Raw
                </button>
              </div>
            </div>

            <div className="modal-body">
              {loadingDetail ? (
                <div>Cargando detalle...</div>
              ) : !showRaw ? (
                <div className="product-detail">
                  <div className="detail-row">
                    <div className="detail-label">ID:</div>
                    <div className="detail-value">{selectedProduct.id}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Nombre:</div>
                    <div className="detail-value">{selectedProduct.name}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">SKU:</div>
                    <div className="detail-value">{selectedProduct.sku}</div>
                  </div>
                  {selectedProduct.price && (
                    <div className="detail-row">
                      <div className="detail-label">Precio:</div>
                      <div className="detail-value">${selectedProduct.price}</div>
                    </div>
                  )}
                  {selectedProduct.category && (
                    <div className="detail-row">
                      <div className="detail-label">Categoría:</div>
                      <div className="detail-value">{selectedProduct.category}</div>
                    </div>
                  )}
                  {selectedProduct.description && (
                    <div className="detail-row">
                      <div className="detail-label">Descripción:</div>
                      <div className="detail-value">{selectedProduct.description}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="raw-data">
                  <pre>
                    {format === 'application/json' 
                      ? JSON.stringify(JSON.parse(productDetail || '{}'), null, 2)
                      : productDetail
                    }
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;