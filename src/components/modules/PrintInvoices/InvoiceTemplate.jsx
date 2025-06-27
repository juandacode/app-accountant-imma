
import React from 'react';

const InvoiceTemplate = ({ invoice, type }) => {
  const isSale = type === 'venta';
  const entity = isSale ? invoice.clientes : invoice.proveedores;
  const entityNameField = isSale ? 'nombre_completo' : 'nombre_proveedor';
  const entityIdField = isSale ? 'cedula_id' : 'cedula_fiscal';
  const items = isSale ? invoice.facturas_venta_detalles : invoice.facturas_compra_detalles;
  const unitPriceField = isSale ? 'precio_unitario' : 'costo_unitario';
  const discount = parseFloat(invoice.descuento) || 0;
  const subtotalGeneral = items?.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0) || 0;
  const totalFinal = subtotalGeneral - discount;

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('es', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00'); 
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const logoUrl = "/lovable-uploads/507173b0-6c76-4763-9bf5-5c5cdd4362b0.png"; 
  const primaryColor = "#E0AFA7"; 

  return (
    <div className="invoice-box p-6 bg-white rounded-lg shadow-md font-sans text-sm min-h-[90vh] flex flex-col">
      <style>{`
        .invoice-box {
          font-family: 'Arial', sans-serif;
          color: #333;
        }
        .header-section {
          border-bottom: 2px solid ${primaryColor};
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header-section .logo {
          max-height: 80px;
          width: auto;
        }
        .header-section .invoice-title {
          font-size: 1.8em;
          font-weight: bold;
          color: ${primaryColor};
          text-align: right;
        }
        .header-section .invoice-number {
          font-size: 1em;
          text-align: right;
          color: #555;
        }
        .client-details p {
          margin-bottom: 2px;
        }
        .section-title {
          font-size: 0.9em;
          font-weight: bold;
          color: #555;
          margin-bottom: 5px;
          text-transform: uppercase;
          border-bottom: 1px solid #eee;
          padding-bottom: 3px;
        }
        .items-table th {
          background-color: ${primaryColor}33; 
          padding: 8px;
          text-align: left;
          font-weight: bold;
        }
        .items-table td {
          padding: 8px;
          border-bottom: 1px solid #eee;
        }
        .items-table .text-right { text-align: right; }
        .totals-section {
          margin-top: auto;
          padding-top: 20px;
        }
        .totals-table td { padding: 4px 0; }
        .totals-table .label { font-weight: bold; color: #555; padding-right: 10px; }
        .totals-table .grand-total .label, .totals-table .grand-total .value {
          font-size: 1.1em;
          font-weight: bold;
          color: ${primaryColor};
          padding-top: 8px;
          border-top: 2px solid ${primaryColor};
        }
        .footer-info {
          text-align: center;
          font-size: 0.85em;
          color: #777;
          border-top: 1px solid #eee;
          padding-top: 15px;
          margin-top: 20px;
        }
      `}</style>
      
      <div className="header-section grid grid-cols-2 gap-4 items-start">
        <div>
          <img src={logoUrl} alt="Beauty Blouse Logo" className="logo" />
        </div>
        <div className="invoice-info">
          <p className="invoice-title">{isSale ? 'FACTURA DE VENTA' : 'FACTURA DE COMPRA'}</p>
          <p className="invoice-number">No. {invoice.numero_factura}</p>
          <p className="mt-2"><strong>Fecha Emisión:</strong> {formatDate(invoice.fecha_emision)}</p>
          {invoice.fecha_vencimiento && (
            <p><strong>Fecha Vencimiento:</strong> {formatDate(invoice.fecha_vencimiento)}</p>
          )}
        </div>
      </div>

      <div className="client-details mb-6 p-3 bg-gray-50 rounded-md border border-gray-200">
        <p className="section-title">{isSale ? 'Datos del Cliente:' : 'Datos del Proveedor:'}</p>
        <p className="font-bold">{entity?.[entityNameField]}</p>
        <p>{entityIdField}: {entity?.[entityIdField]}</p>
        <p>{entity?.direccion}</p>
        <p>{entity?.ciudad}</p>
      </div>
      
      <div className="mb-6">
        <p className="section-title">Detalles de la Factura:</p>
        <p><strong>Forma de Pago:</strong> {invoice.forma_pago}</p>
        {invoice.descripcion_factura && (
            <p className="text-xs italic mt-1"><strong>Notas:</strong> {invoice.descripcion_factura}</p>
        )}
      </div>

      <table className="w-full items-table mb-6">
        <thead>
          <tr>
            <th className="w-1/12 text-center">Cant.</th>
            <th className="w-5/12">Descripción (Referencia)</th>
            <th className="w-2/12 text-right">Precio Unit.</th>
            <th className="w-2/12 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items && items.map((item, index) => (
            <tr key={item.id || index}>
              <td className="text-center">{item.cantidad}</td>
              <td>{item.productos?.nombre} ({item.productos?.sku})</td>
              <td className="text-right">${formatCurrency(item[unitPriceField])}</td>
              <td className="text-right">${formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="totals-section">
        <div className="flex justify-end">
          <table className="w-2/5 max-w-xs totals-table">
              <tbody>
                  <tr>
                      <td className="label">Subtotal:</td>
                      <td className="text-right value">${formatCurrency(subtotalGeneral)}</td>
                  </tr>
                  {discount > 0 && (
                       <tr>
                          <td className="label">Descuento:</td>
                          <td className="text-right value text-red-600">-${formatCurrency(discount)}</td>
                      </tr>
                  )}
                  <tr className="grand-total">
                      <td className="label">TOTAL:</td>
                      <td className="text-right value">${formatCurrency(totalFinal)}</td>
                  </tr>
              </tbody>
          </table>
        </div>
        
        <div className="footer-info">
          <p>Gracias por su {isSale ? 'compra' : 'negocio'}.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
