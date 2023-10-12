import {
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
  path: string;
  data?: unknown;
}>;

const ModalInstanceContext = createContext<ModalInstanceProviderValue | null>(
  null
);

export const ModalInstanceProvider: FC<ModalInstanceProviderProps> = ({
  children,
  path,
  data,
  isOpen,
}) => {
  const { close: closePath } = useModalInternal();

  const close = useCallback(() => {
    closePath(path);
  }, [closePath, path]);

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
