import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ConfirmationDialogContext = createContext();

export const useConfirmationDialog = () => useContext(ConfirmationDialogContext);

const ConfirmationDialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
  });

  const confirm = useCallback(({ title, description, confirmText, cancelText }) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        description,
        confirmText: confirmText || 'Confirmar',
        cancelText: cancelText || 'Cancelar',
        onConfirm: () => {
          setDialogState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialogState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <ConfirmationDialogContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog open={dialogState.isOpen} onOpenChange={(isOpen) => { if (!isOpen) dialogState.onCancel(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogState.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={dialogState.onCancel}>
              {dialogState.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction onClick={dialogState.onConfirm}>
              {dialogState.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmationDialogContext.Provider>
  );
};

export default ConfirmationDialogProvider;