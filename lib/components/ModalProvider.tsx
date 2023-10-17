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

const getId = (() => {
  let currentId = 0;
  const map = new WeakMap();

  return (object: object) => {
    if (!map.has(object)) {
      map.set(object, ++currentId);
    }

    return map.get(object);
  };
})();

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

const ModalContext = createContext<ModalProviderValue | null>(null);

type ModalProviderValue = {
  open: (pathOrComponent: string | ComponentType, data: unknown) => void;
  close: (pathOrComponent: string | ComponentType, data: unknown) => void;
  getComponentInstances: (Component: ComponentType) => Instance[];
};

type ModalProviderProps = PropsWithChildren<{
  modals?: [path: string, Component: ComponentType][];
}>;

type Instance = {
  path: string;
  data: unknown;
  isOpen: boolean;
};

function matchPath(
  routeRegexes: [string, RegExp][],
  path: string
): string | null {
  for (const [route, regex] of routeRegexes) {
    if (regex.test(path)) return route;
  }

  return null;
}

export const ModalProvider: FC<ModalProviderProps> = ({
  children,
  modals = [],
}) => {
  const [instances, setInstances] = useState<Record<string, Instance[]>>({});

  const routeRegexes: [string, RegExp][] = useMemo(
    () =>
      modals.map((m) => [
        m[0],
        new RegExp(
          m[0]
            .split("/")
            .map((seg) => seg.replace(/:.*/, "[^/]+"))
            .join("\\/")
        ),
      ]),
    [modals]
  );

  const getPathAndKey = useCallback(
    (pathOrComponent: string | ComponentType, data: unknown) => {
      if (typeof pathOrComponent === "string") {
        const parsedPath = parse(pathOrComponent, data);
        const rawPath = matchPath(routeRegexes, pathOrComponent);
        const modal = modals.find((m) => m[0] === rawPath);

        if (!modal) {
          throw new Error(
            `no registered modal path matched for ${pathOrComponent}`
          );
        }

        return [parsedPath, getId(modal[1])];
      } else {
        const modal = modals.find((m) => m[1] === pathOrComponent);
        const path = modal ? parse(modal[0], data) : "";
        return [path, getId(pathOrComponent)];
      }
    },
    [modals, routeRegexes]
  );

  const open = useCallback(
    (pathOrComponent: string | ComponentType, data: unknown) => {
      const [path, componentKey] = getPathAndKey(pathOrComponent, data);

      setInstances(
        produce((oldInsts) => {
          if (!oldInsts[componentKey]) {
            oldInsts[componentKey] = [];
          }

          const inst = oldInsts[componentKey].find((i) => i.path === path);
          if (!inst) {
            oldInsts[componentKey].push({
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
    [getPathAndKey]
  );

  const close = useCallback(
    (pathOrComponent: string | ComponentType, data: unknown) => {
      const [path, componentKey] = getPathAndKey(pathOrComponent, data);

      setInstances(
        produce((oldInsts) => {
          if (!oldInsts[componentKey]) {
            oldInsts[componentKey] = [];
          }

          const inst = oldInsts[componentKey].find(
            (inst) => inst.path === path
          );
          if (!inst) return;

          inst.isOpen = false;
        })
      );
    },
    [getPathAndKey]
  );

  const getComponentInstances = useCallback(
    (Component: ComponentType) => {
      const componentKey = getId(Component);

      return instances[componentKey] ?? [];
    },
    [instances]
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

export const useModal = (pathOrComponent: string | ComponentType) => {
  const { open: openPath, close: closePath } = useContext(
    ModalContext
  ) as ModalProviderValue;

  const open: <T = unknown>(data?: T) => void = (data) => {
    openPath(pathOrComponent, data);
  };

  const close: (pathParams?: unknown) => void = (pathParams) => {
    closePath(pathOrComponent, pathParams);
  };

  return {
    open,
    close,
  };
};

export const useModalInternal = () => {
  return useContext(ModalContext) as ModalProviderValue;
};
