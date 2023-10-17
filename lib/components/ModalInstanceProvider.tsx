import {
  ComponentType,
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useModalInternal } from "./ModalProvider";

type ModalInstanceProviderValue<T = unknown> = {
  isOpen: boolean;
  close: () => void;
  data: T;
};

type ModalInstanceProviderProps = PropsWithChildren<{
  isOpen: boolean;
  data?: unknown;
  Component: ComponentType;
}>;

const ModalInstanceContext = createContext<ModalInstanceProviderValue | null>(
  null
);

export const ModalInstanceProvider: FC<ModalInstanceProviderProps> = ({
  children,
  data,
  isOpen,
  Component,
}) => {
  const { close: closeModal } = useModalInternal();

  const close = useCallback(() => {
    closeModal(Component, data);
  }, [Component, closeModal, data]);

  const value = useMemo(
    () => ({
      isOpen,
      close,
      data,
    }),
    [close, data, isOpen]
  );

  return (
    <ModalInstanceContext.Provider value={value}>
      {children}
    </ModalInstanceContext.Provider>
  );
};

export const useModalInstance = <T,>() => {
  return useContext(ModalInstanceContext) as ModalInstanceProviderValue<T>;
};
