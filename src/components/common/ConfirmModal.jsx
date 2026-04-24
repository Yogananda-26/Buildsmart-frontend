import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmModal = ({ show, onHide, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger', confirmDisabled = false, confirmLoading = false }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={confirmLoading}>
          Cancel
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={confirmDisabled || confirmLoading}>
          {confirmLoading ? 'Processing...' : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
