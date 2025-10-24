# 🛍️ Catálogo de Productos - Laboratorio 10

Aplicación React para consumir un API REST de productos con autenticación mediante API Key y negociación de contenido (JSON/XML).

## 📋 Descripción

Este proyecto es una aplicación web desarrollada en React que consume un API de productos protegido mediante API Key. Permite visualizar, filtrar, ordenar y paginar productos, además de mostrar detalles completos de cada producto incluyendo su respuesta cruda (raw) del servidor.

## ✨ Características

- ✅ Consumo de API REST con autenticación mediante API Key
- ✅ Negociación de contenido: JSON/XML
- ✅ Paginación dinámica con selector de tamaño de página (6, 12, 24, 48 items)
- ✅ Ordenamiento del lado del cliente por nombre y precio
- ✅ Vista detallada de productos en modal
- ✅ Toggle para visualizar respuesta Raw (JSON/XML)
- ✅ Estados de carga con skeletons
- ✅ Manejo de errores con opción de reintentar
- ✅ Estado vacío cuando no hay productos
- ✅ Diseño responsivo y moderno
- ✅ Animaciones y transiciones suaves

## 🚀 Instalación

### Prerrequisitos

- Node.js (versión 14 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar o descargar el proyecto**

```bash
cd productos-app
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar la API**

Edita el archivo `src/config.js` y agrega tu URL base y API Key:

```javascript
export const API_CONFIG = {
  baseURL: 'https://tu-api.com',  // Tu URL base del API
  apiKey: 'tu-api-key-aqui'        // Tu API Key
};
```

4. **Ejecutar el proyecto**

```bash
npm start
```

La aplicación se abrirá automáticamente en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
productos-app/
├── public/
│   └── index.html
├── src/
│   ├── App.js           # Componente principal
│   ├── App.css          # Estilos de la aplicación
│   ├── config.js        # Configuración del API
│   └── index.js         # Punto de entrada
├── package.json
└── README.md
```

## 🎯 Funcionalidades Implementadas

### 1. Controles Superiores

- **Selector de formato**: Permite cambiar entre JSON y XML
- **Selector de tamaño de página**: Opciones de 6, 12, 24 y 48 productos por página
- **Ordenamiento**: 
  - Nombre (A-Z / Z-A)
  - Precio (Menor a Mayor / Mayor a Menor)

### 2. Listado de Productos

- Grid responsivo que se adapta al tamaño de pantalla
- Cards con nombre y SKU del producto
- Efecto hover con animación
- Click para ver detalles

### 3. Detalle de Producto (Modal)

- Vista completa con todos los campos del producto
- Toggle entre vista amigable y vista Raw
- Vista Raw con formato apropiado según JSON/XML
- Diseño limpio y fácil de leer

### 4. Paginación

- Botones Anterior/Siguiente
- Indicador de página actual y total de páginas
- Deshabilitación automática en límites

### 5. Estados de UI

- **Loading**: Skeletons animados durante la carga
- **Error**: Mensaje de error con botón de reintentar
- **Vacío**: Mensaje cuando no hay productos
- **role="alert"**: Para accesibilidad en mensajes de error

## 🔧 Tecnologías Utilizadas

- **React** 18.x
- **JavaScript ES6+**
- **CSS3** con Grid y Flexbox
- **Fetch API** para peticiones HTTP
- **DOMParser** para procesamiento de XML

## 📡 API Endpoints Utilizados

### GET /api/products
Obtiene lista de productos con paginación

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Cantidad de productos por página (default: 6)

**Headers:**
- `x-api-key`: Tu API Key
- `Accept`: `application/json` o `application/xml`

**Respuesta JSON:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "iPhone 15 Pro",
      "sku": "APPLE-IP15P-001",
      "price": 999.99,
      "category": "Electronics",
      "description": "Latest iPhone..."
    }
  ],
  "totalPages": 5
}
```

### GET /api/products/:id
Obtiene detalle de un producto específico

**Headers:**
- `x-api-key`: Tu API Key
- `Accept`: `application/json` o `application/xml`

## 🎨 Características de Diseño

- Gradiente moderno en el fondo
- Cards con sombras y efectos hover
- Modal con animaciones de entrada
- Código raw con tema oscuro estilo IDE
- Colores principales: #667eea (púrpura) y #764ba2 (violeta)
- Diseño totalmente responsivo

## 📱 Responsive Design

La aplicación se adapta a diferentes tamaños de pantalla:
- **Desktop**: Grid de múltiples columnas
- **Tablet**: Grid de 2 columnas
- **Mobile**: Grid de 1 columna

## 🔐 Seguridad

- API Key almacenada en archivo de configuración
- Headers de autenticación en todas las peticiones
- Validación de respuestas del servidor

## 🐛 Manejo de Errores

- Try-catch en todas las peticiones asíncronas
- Mensajes de error descriptivos
- Botón de reintentar en caso de fallo
- Estados de carga para mejor UX

## ⚡ Hooks de React Utilizados

- `useState`: Para manejo de estados
- `useEffect`: Para efectos secundarios y carga de datos




## 👨‍💻 Autor
 Gadyr Calderón Díaz



---

**Fecha de entrega**: Viernes 24 de octubre, 5:00 p.m.
**Plataforma**: TEC Digital
