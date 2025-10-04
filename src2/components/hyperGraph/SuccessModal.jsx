import React from 'react';

function SuccessModal({ isOpen, onClose, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-black text-white rounded-lg p-8 max-w-md mx-4 text-center border border-white/20">
                <i className="fas fa-check-circle text-6xl text-green-400 mb-4"></i>
                <h3 className="text-xl font-bold mb-2">Success!</h3>
                <p className="mb-6">{message}</p>
                <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200">
                    Close
                </button>
            </div>
        </div>
    );
}

export default SuccessModal;