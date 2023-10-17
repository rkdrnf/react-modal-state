import "./App.css";

import { Box, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useModalInstance, ModalProvider, useModal, ModalRenderer } from "../";

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

  const { open: openUser } = useModal(UserModal);

  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>User {data.id}</DialogTitle>
      <DialogContent>
        {data.name}'s profile
        <Box>
          <button onClick={() => openUser({ id: 1, name: "Steve" })}>
            User 1
          </button>
          <button onClick={() => openUser({ id: 2, name: "James" })}>
            User 2
          </button>
          <button onClick={() => openUser({ id: 3, name: "Peter" })}>
            User 3
          </button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

function Content() {
  const { open: openNewUser } = useModal(NewUserModal);
  const { open: openUser } = useModal(UserModal);
  return (
    <Box>
      <button onClick={() => openNewUser()}>New User</button>
      <button onClick={() => openUser({ id: 1, name: "Steve" })}>User 1</button>
      <button onClick={() => openUser({ id: 2, name: "James" })}>User 2</button>
      <button onClick={() => openUser({ id: 3, name: "Peter" })}>User 3</button>
    </Box>
  );
}

function App() {
  return (
    <ModalProvider modals={[["users/:id", UserModal]]}>
      <Content />
      <ModalRenderer Component={NewUserModal} />
      <ModalRenderer Component={UserModal} />
    </ModalProvider>
  );
}

export default App;
