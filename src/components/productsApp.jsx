import React, { useState, useEffect } from 'react';

// Configuración de la API
const API_BASE_URL = 'https://tu-api.com'; // CAMBIA ESTO por tu URL del Lab 8
const API_KEY = 'TU_API_KEY_AQUI'; // CAMBIA ESTO por tu API Key

export default function ProductsApp() {
  // Estados principales
  const [products, setProducts] = useState([]);
  const [format, setFormat] = useState('application/json');
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('name:asc');
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [rawProductData, setRawProductData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Función para obtener productos
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/products?page=${currentPage}&limit=${pageSize}`,
        {
          headers: {
            'x-api-key': API_KEY,
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
        const xmlText = await response.text();
        data = parseXMLProducts(xmlText);
      }

      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para parsear XML
  const parseXMLProducts = (xmlText) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const productsNodes = xmlDoc.getElementsByTagName('product');
    const products = Array.from(productsNodes).map(node => ({
      id: node.getElementsByTagName('id')[0]?.textContent,
      name: node.getElementsByTagName('name')[0]?.textContent,
      sku: node.getElementsByTagName('sku')[0]?.textContent,
      price: parseFloat(node.getElementsByTagName('price')[0]?.textContent || 0),
      description: node.getElementsByTagName('description')[0]?.textContent,
      category: node.getElementsByTagName('category')[0]?.textContent,
      image: node.getElementsByTagName('image')[0]?.textContent
    }));

    const totalPages = parseInt(xmlDoc.getElementsByTagName('totalPages')[0]?.textContent || 1);
    
    return { products, totalPages };
  };

  // Función para obtener detalle del producto
  const fetchProductDetail = async (productId) => {
    setLoadingDetail(true);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}`,
        {
          headers: {
            'x-api-key': API_KEY,
            'Accept': format
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.text();
      setRawProductData(rawData);

      let productData;
      if (format === 'application/json') {
        productData = JSON.parse(rawData);
      } else {
        const parsed = parseXMLProducts(rawData);
        productData = parsed.products[0];
      }

      setSelectedProduct(productData);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Aplicar ordenamiento del lado del cliente
  const sortProducts = (productsArray) => {
    const [field, order] = sortBy.split(':');
    
    return [...productsArray].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      if (field === 'price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Effect para cargar productos
  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, format]);

  // Handlers
  const handleFormatChange = (e) => {
    setFormat(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleProductClick = (product) => {
    setShowRaw(false);
    fetchProductDetail(product.id);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setRawProductData(null);
    setShowRaw(false);
  };

  const handleRetry = () => {
    fetchProducts();
  };

  // Productos ordenados
  const sortedProducts = sortProducts(products);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Catálogo de Productos
          </h1>
          <p className="text-gray-600">
            Laboratorio 10 - IC8057
          </p>
        </header>

        {/* Controles Superiores */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Selector de Formato */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Formato de Datos
              </label>
              <select
                value={format}
                onChange={handleFormatChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="application/json">JSON</option>
                <option value="application/xml">XML</option>
              </select>
              <p className="text-xs text-gray-500">
                Cambia el header Accept
              </p>
            </div>

            {/* Selector de Tamaño de Página */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Items por Página
              </label>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value={6}>6 items</option>
                <option value={12}>12 items</option>
                <option value={24}>24 items</option>
                <option value={48}>48 items</option>
              </select>
              <p className="text-xs text-gray-500">
                Ajusta limit y reinicia page=1
              </p>
            </div>

            {/* Selector de Ordenamiento */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Ordenar Por (Cliente)
              </label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="name:asc">Nombre (A → Z)</option>
                <option value="name:desc">Nombre (Z → A)</option>
                <option value="price:asc">Precio (Menor → Mayor)</option>
                <option value="price:desc">Precio (Mayor → Menor)</option>
              </select>
              <p className="text-xs text-gray-500">
                Ordenamiento en memoria
              </p>
            </div>
          </div>
        </div>

        {/* Estado de Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6" role="alert">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Error al cargar productos</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Listado de Productos */}
        {loading ? (
          // Skeletons de Carga
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(pageSize)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          // Estado Vacío
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay productos para mostrar
            </h3>
            <p className="text-gray-600">
              No se encontraron productos en esta página.
            </p>
          </div>
        ) : (
          // Grid de Productos
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group"
              >
                {product.image && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    SKU: {product.sku}
                  </p>
                  {product.price && (
                    <p className="text-lg font-bold text-blue-600">
                      ${parseFloat(product.price).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Controles de Paginación */}
        {!loading && sortedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Página <span className="font-semibold">{currentPage}</span> de{' '}
                <span className="font-semibold">{totalPages}</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalle */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-sm text-gray-600">SKU: {selectedProduct.sku}</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido del Modal */}
              <div className="p-6">
                {loadingDetail ? (
                  // Skeleton del detalle
                  <div className="space-y-4 animate-pulse">
                    <div className="h-64 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : showRaw ? (
                  // Vista Raw
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Respuesta Raw</h3>
                      <button
                        onClick={() => setShowRaw(false)}
                        className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Ver Vista Amigable
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                      {format === 'application/json' 
                        ? JSON.stringify(JSON.parse(rawProductData), null, 2)
                        : rawProductData
                      }
                    </pre>
                  </div>
                ) : (
                  // Vista Amigable
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">Detalles del Producto</h3>
                      <button
                        onClick={() => setShowRaw(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Ver Raw
                      </button>
                    </div>

                    {selectedProduct.image && (
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-64 object-cover rounded-lg mb-6"
                      />
                    )}

                    <div className="space-y-4">
                      {selectedProduct.price && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Precio</label>
                          <p className="text-2xl font-bold text-blue-600">
                            ${parseFloat(selectedProduct.price).toFixed(2)}
                          </p>
                        </div>
                      )}

                      {selectedProduct.category && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Categoría</label>
                          <p className="text-gray-900">{selectedProduct.category}</p>
                        </div>
                      )}

                      {selectedProduct.description && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Descripción</label>
                          <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <label className="text-sm font-semibold text-gray-700">ID</label>
                          <p className="text-gray-900">{selectedProduct.id}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">SKU</label>
                          <p className="text-gray-900">{selectedProduct.sku}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}