import {
  ComponentType,
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { produce } from "immer";

const ModalContext = createContext<ModalProviderValue | null>(null);

type ModalProviderValue = {
  open: (path: string, data: unknown) => void;
  close: (path: string) => void;
  getComponentInstances: (Component: ComponentType) => Instance[];
};

type ModalProviderProps = PropsWithChildren<{
  modals: [path: string, Component: ComponentType][];
}>;

type Instance = {
  path: string;
  data: unknown;
  isOpen: boolean;
};

function matchPath(routes: string[], path: string): string | null {
  for (const route of routes) {
    const regex = route
      .split("/")
      .map((seg) => seg.replace(/:.*/, "[^/]+"))
      .join("\\/");

    if (new RegExp(regex).test(path)) return route;
  }

  return null;
}

export const ModalProvider: FC<ModalProviderProps> = ({
  children,
  modals = [],
}) => {
  const [instances, setInstances] = useState<Record<string, Instance[]>>({});

  const routes = useMemo(() => modals.map((m) => m[0]), [modals]);

  const open = useCallback(
    (path: string, data: unknown) => {
      const rawPath = matchPath(routes, path);

      if (!rawPath) {
        console.error(`no registered modal path matched for ${path}`);
        return;
      }

      setInstances(
        produce((oldInsts) => {
          if (!oldInsts[rawPath]) {
            oldInsts[rawPath] = [];
          }

          const inst = oldInsts[rawPath].find((i) => i.path === path);
          if (!inst) {
            oldInsts[rawPath].push({
              path,
              data,
              isOpen: true,
            });
          } else {
            inst.data = data;
            inst.isOpen = true;
          }
        })
      );
    },
    [routes]
  );

  const close = useCallback(
    (path: string) => {
      const rawPath = matchPath(routes, path);

      if (!rawPath) {
        console.error(`no registered modal path matched for ${path}`);
        return;
      }

      setInstances(
        produce((oldInsts) => {
          if (!oldInsts[rawPath]) {
            oldInsts[rawPath] = [];
          }

          const inst = oldInsts[rawPath].find((inst) => inst.path === path);
          if (!inst) return;

          inst.isOpen = false;
        })
      );
    },
    [routes]
  );

  const getComponentInstances = useCallback(
    (Component: ComponentType) => {
      const modal = modals.find((m) => m[1] === Component);

      if (!modal) {
        console.error(
          `Component ${Component.name} is not registered in ModalProvider.`
        );
        return [];
      }

      return instances[modal[0]] ?? [];
    },
    [instances, modals]
  );

  const value = useMemo(
    () => ({
      open,
      close,
      getComponentInstances,
    }),
    [close, getComponentInstances, open]
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

function parse(path: string, params?: unknown): string {
  return path
    .split("/")
    .map((p) => {
      if (!p.startsWith(":")) return p;

      const paramName = p.slice(1);

      return String((params as Record<string, unknown>)?.[paramName]);
    })
    .join("/");
}

export const useModal = (rawPath: string) => {
  const { open: openPath, close: closePath } = useContext(
    ModalContext
  ) as ModalProviderValue;

  const open: <T = unknown>(data?: T) => void = (data) => {
    const parsedPath = parse(rawPath, data);
    openPath(parsedPath, data);
  };

  const close: (pathParams?: unknown) => void = (pathParams) => {
    const parsedPath = parse(rawPath, pathParams);
    closePath(parsedPath);
  };

  return {
    open,
    close,
  };
};

export const useModalInternal = () => {
  return useContext(ModalContext) as ModalProviderValue;
};
