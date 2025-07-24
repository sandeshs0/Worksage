export const generateInvoiceHTML = (invoiceData, invoiceNumber = null) => {
  const formatCurrency = (amount) => {
    return (
      "Rs. " +
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(amount)
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const currentYear = new Date().getFullYear();
  const displayInvoiceNumber = invoiceNumber || `INV-${currentYear}-001`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${displayInvoiceNumber}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .invoice-container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 3px solid #18cb96;
            padding-bottom: 20px;
        }
        .company-info h1 {
            color: #18cb96;
            font-size: 36px;
            margin: 0 0 10px 0;
            font-weight: bold;
        }
        .company-info p {
            margin: 5px 0;
            color: #666;
        }
        .invoice-details {
            background: #f8f9fa;
            border: 2px solid #18cb96;
            border-radius: 8px;
            padding: 20px;
            text-align: right;
            min-width: 250px;
        }
        .invoice-details h2 {
            color: #18cb96;
            font-size: 24px;
            margin: 0 0 15px 0;
        }
        .invoice-details p {
            margin: 8px 0;
            color: #333;
        }
        .invoice-details .label {
            font-weight: 600;
            color: #18cb96;
        }
        .bill-to {
            margin: 30px 0;
        }
        .bill-to h3 {
            color: #18cb96;
            font-size: 20px;
            margin-bottom: 15px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 5px;
        }
        .bill-to-content {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 20px;
        }
        .bill-to-content p {
            margin: 5px 0;
        }
        .client-name {
            font-weight: 600;
            font-size: 18px;
            color: #333;
        }
        .project-info {
            margin: 30px 0;
        }
        .project-info h3 {
            color: #18cb96;
            font-size: 20px;
            margin-bottom: 15px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 5px;
        }
        .project-content {
            background: #e3f2fd;
            border: 1px solid #90caf9;
            border-radius: 6px;
            padding: 20px;
        }
        .project-name {
            font-weight: 600;
            font-size: 18px;
            color: #1976d2;
            margin-bottom: 5px;
        }
        .project-description {
            color: #1565c0;
            font-size: 14px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .items-table th {
            background: #18cb96;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
        }
        .items-table th:last-child,
        .items-table td:last-child {
            text-align: right;
        }
        .items-table th:nth-child(2),
        .items-table th:nth-child(3),
        .items-table td:nth-child(2),
        .items-table td:nth-child(3) {
            text-align: center;
        }
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #e9ecef;
            background: white;
        }
        .items-table tbody tr:hover {
            background: #f8f9fa;
        }
        .items-table tbody tr:last-child td {
            border-bottom: none;
        }
        .totals-section {
            display: flex;
            justify-content: flex-end;
            margin: 30px 0;
        }
        .totals-box {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 25px;
            min-width: 300px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
        }
        .totals-row.subtotal {
            color: #666;
        }
        .totals-row.tax {
            color: #666;
        }
        .totals-row.discount {
            color: #dc3545;
        }
        .totals-row.total {
            border-top: 2px solid #18cb96;
            padding-top: 15px;
            margin-top: 15px;
            font-size: 20px;
            font-weight: bold;
            color: #18cb96;
        }
        .section {
            margin: 30px 0;
        }
        .section h3 {
            color: #18cb96;
            font-size: 18px;
            margin-bottom: 15px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 5px;
        }
        .section-content {
            background: #fff8e1;
            border: 1px solid #ffcc02;
            border-radius: 6px;
            padding: 20px;
            white-space: pre-wrap;
            line-height: 1.6;
        }
        .terms-content {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
        }
        .payment-content {
            background: #e3f2fd;
            border: 1px solid #90caf9;
            color: #1565c0;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e9ecef;
            color: #666;
        }
        .footer p {
            margin: 10px 0;
        }
        .thank-you {
            font-size: 18px;
            font-weight: 600;
            color: #18cb96;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .invoice-container {
                padding: 20px;
            }
            .header {
                flex-direction: column;
                gap: 20px;
            }
            .invoice-details {
                text-align: left;
                min-width: auto;
            }
            .items-table {
                font-size: 14px;
            }
            .items-table th,
            .items-table td {
                padding: 10px 8px;
            }
            .totals-box {
                min-width: auto;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header Section -->
        <div class="header">
            <div class="company-info">
                <h1>INVOICE</h1>
                <p><strong>${
                  invoiceData.project?.name || "Your Company"
                }</strong></p>
            </div>
            <div class="invoice-details">
                <h2>${displayInvoiceNumber}</h2>
                <p><span class="label">Issue Date:</span> ${formatDate(
                  invoiceData.issueDate
                )}</p>
                <p><span class="label">Due Date:</span> ${formatDate(
                  invoiceData.dueDate
                )}</p>
                <p><span class="label">Status:</span> Pending Payment</p>
            </div>
        </div>

        <!-- Bill To Section -->
        <div class="bill-to">
            <h3>Bill To:</h3>
            <div class="bill-to-content">
                <p class="client-name">${
                  invoiceData.client?.name || "Client Name"
                }</p>
                <p>${invoiceData.client?.email || "client@example.com"}</p>
                ${
                  invoiceData.client?.address
                    ? `<p>${invoiceData.client.address}</p>`
                    : ""
                }
                ${
                  invoiceData.client?.city && invoiceData.client?.state
                    ? `<p>${invoiceData.client.city}, ${
                        invoiceData.client.state
                      } ${invoiceData.client.zipCode || ""}</p>`
                    : ""
                }
            </div>
        </div>

        ${
          invoiceData.project
            ? `
        <!-- Project Information -->
        <div class="project-info">
            <h3>Project:</h3>
            <div class="project-content">
                <div class="project-name">${invoiceData.project.name}</div>
                ${
                  invoiceData.project.description
                    ? `<div class="project-description">${invoiceData.project.description}</div>`
                    : ""
                }
            </div>
        </div>
        `
            : ""
        }

        <!-- Line Items -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoiceData.items
                  .map(
                    (item) => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.unitPrice)}</td>
                        <td><strong>${formatCurrency(
                          item.quantity * item.unitPrice
                        )}</strong></td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>

        <!-- Totals Section -->
        <div class="totals-section">
            <div class="totals-box">
                <div class="totals-row subtotal">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(invoiceData.subtotal)}</span>
                </div>
                
                ${
                  invoiceData.taxAmount > 0
                    ? `
                <div class="totals-row tax">
                    <span>Tax (${
                      invoiceData.taxType === "percentage"
                        ? `${invoiceData.taxRate}%`
                        : "Fixed"
                    }):</span>
                    <span>${formatCurrency(invoiceData.taxAmount)}</span>
                </div>
                `
                    : ""
                }
                
                ${
                  invoiceData.discountAmount > 0
                    ? `
                <div class="totals-row discount">
                    <span>Discount (${
                      invoiceData.discountType === "percentage"
                        ? `${invoiceData.discountValue}%`
                        : "Fixed"
                    }):</span>
                    <span>-${formatCurrency(invoiceData.discountAmount)}</span>
                </div>
                `
                    : ""
                }
                
                <div class="totals-row total">
                    <span>Total:</span>
                    <span>${formatCurrency(invoiceData.total)}</span>
                </div>
            </div>
        </div>

        ${
          invoiceData.notes
            ? `
        <!-- Notes Section -->
        <div class="section">
            <h3>Notes:</h3>
            <div class="section-content">
                ${invoiceData.notes}
            </div>
        </div>
        `
            : ""
        }

        ${
          invoiceData.terms
            ? `
        <!-- Terms Section -->
        <div class="section">
            <h3>Terms & Conditions:</h3>
            <div class="section-content terms-content">
                ${invoiceData.terms}
            </div>
        </div>
        `
            : ""
        }

        ${
          invoiceData.paymentInstructions
            ? `
        <!-- Payment Instructions -->
        <div class="section">
            <h3>Payment Instructions:</h3>
            <div class="section-content payment-content">
                ${invoiceData.paymentInstructions}
            </div>
        </div>
        `
            : ""
        }

        <!-- Footer -->
        <div class="footer">
            <p class="thank-you">Thank you for your business!</p>
            <p>For questions about this invoice, please contact.</p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
                This invoice was generated on ${new Date().toLocaleDateString()} by ${
    invoiceData.project?.name || "Your Company"
  }
            </p>
        </div>
    </div>
</body>
</html>`;
};
