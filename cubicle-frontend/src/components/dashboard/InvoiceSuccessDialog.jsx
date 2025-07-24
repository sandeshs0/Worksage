import React from 'react';
import { CheckCircle, Mail, Clock } from 'lucide-react';

const InvoiceSuccessDialog = ({ invoice, onClose, onSendNow }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Invoice Created Successfully!</h3>
          <p className="text-gray-600 mb-6">
            Your invoice ({invoice.invoiceNumber}) has been saved as a draft. Would you like to send it to the client now?
          </p>
          
          <div className="flex space-x-4 w-full">
            <button
              onClick={onSendNow}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-[#007991] text-white rounded-lg hover:bg-[#007991]/80 transition-colors"
            >
              <Mail className="h-5 w-5 mr-2" />
              Send Now
            </button>
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Clock className="h-5 w-5 mr-2" />
              Send Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSuccessDialog;