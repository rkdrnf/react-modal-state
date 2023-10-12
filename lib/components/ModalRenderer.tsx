import { ComponentType } from "react";
import { ModalInstanceProvider } from "./ModalInstanceProvider";
import { useModalInternal } from "./ModalProvider";

export const ModalRenderer = ({ Component }: { Component: ComponentType }) => {
  const { getComponentInstances } = useModalInternal();

  const insts = getComponentInstances(Component);

  return (
    <>
      {insts.map((inst) => (
        <ModalInstanceProvider
          key={inst.path}
          path={inst.path}
          data={inst.data}
          isOpen={inst.isOpen}
        >
          <Component />
        </ModalInstanceProvider>
      ))}
    </>
  );
};
