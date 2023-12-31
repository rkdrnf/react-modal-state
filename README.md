# React Modal State

This is a tiny library that manages modal in react with minimal dependency.

> [!IMPORTANT]  
> This library is in an early stage. Any issue or feature request would be very helpful to develop this library further!

# Installation

```bash
npm i react-modal-state
```

# Usage

### Place ModalProvider and ModalRenderer

```JSX
import { ModalProvider, ModalRenderer } from "react-modal-state";

...

// Optionally provide modals prop to open modal by id or to use self-nested modals
<ModalProvider modals={[
        ["users/:id", UserModal],
      ]}
    >
    <App />
    <ModalRenderer Component={NewUserModal} />
    <ModalRenderer Component={UserModal} />
</ModalProvider>
```

> [!NOTE]  
> `<ModalRenderer />` does not have to be the direct child of the `<ModalProvider />`. You can place `<ModalRenderer />` in any node under `<ModalProvider />` component tree if needed.

### Open from anywhere

```JSX
import { useModal } from "react-modal-state";

function Content() {
  const { open: openNewUser } = useModal(NewUserModal);
  const { open: openUser } = useModal(UserModal);
  // or alternatively, you can open modal by id defined in ModalProvider
  // const { open: openUser } = useModal("users/:id");

  return (
    <>
      <button onClick={() => openNewUser()}>New User</button>
      <button onClick={() => openUser({ id: 1, name: "Steve" })}>User 1</button>
    </>
  );
}
```

### Declare modal component

```JSX
import { useModalInstance } from "react-modal-state";

const UserModal = () => {
  const { data, isOpen, close } = useModalInstance<{
    id: number;
    name: string;
  }>();

  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>User {data.id}</DialogTitle>
      <DialogContent>
        {data.name}'s profile
      </DialogContent>
    </Dialog>
  );
};
```

# Features

- Very small bundle footprint
- Allow to write modal component with caller interface ignorant manner.
- UI Framework independant. Can be used with any UI framework such as MUI or Headless UI
- Supports nested modal of the same component using parameterized path(`users/:id`). for example, `users/1` can be opened over `users/2`

# Backgrounds

There are many awkward and repetitive points when using modals naively and this library tries to solve these problems.

Typical scenarios are as below.

- Many modals require extra data to be passed when opening modal. If you start to manage more and more modals, component state which opens modal soon become very reptitive with declarations of modal state managing its open state and extra data.

- When you need to open a parent modal from a deeply nested component, you typically have choices below.
  - Pass props to open modal down to the child component. which usually causes a problem known as a prop drilling.
  - Provide methods to manage a modal via Context API or other state management libraries. which also became tedious if you need to manage multiple modals.

Using this library, you can solve above situations elegantly.

Below is an minimal example code using this library (with dialog component from MUI)

```JSX
const NewUserModal = () => {
  const { isOpen, close } = useModalInstance();

  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>New User</DialogTitle>
      <DialogContent>
        <Box>Create new user</Box>
      </DialogContent>
    </Dialog>
  );
};

const UserModal = () => {
  const { data, isOpen, close } = useModalInstance<{
    id: number;
    name: string;
  }>();

  const { open: openUser } = useModal(`users/:id`);

  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>User {data.id}</DialogTitle>
      <DialogContent>
        {data.name}'s profile
      </DialogContent>
    </Dialog>
  );
};


function Content() {
  const { open: openNewUser } = useModal("new-user");
  const { open: openUser } = useModal("users/:id");

  return (
    <Box>
      <button onClick={() => openNewUser()}>New User</button>
      <button onClick={() => openUser({ id: 1, name: "Steve" })}>User 1</button>
    </Box>
  );
}

function App() {
  return (
    <ModalProvider
      modals={[
        ["new-user", NewUserModal],
        ["users/:id", UserModal],
      ]}
    >
      <Content />
      <ModalRenderer Component={NewUserModal} />
      <ModalRenderer Component={UserModal} />
    </ModalProvider>
  );
}
```

In the above code, you can see benefits like

- A component which is responsible to open modal does not need to manage any extra state which is needed in modal. It only calls open (and close if needed)
- Modal component can access methods and custom properties need to render modal by itself. No need to manage props to provide data, which enables modals to be declared and implemented fully indepenently without worrying about the interface it has to provide to opening components.

# Demo and Development

This is a typical vite project.

```bash
npm install
npm run dev
```

to run demo page.
