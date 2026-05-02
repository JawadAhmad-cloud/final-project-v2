import { Outlet } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";

const UserLayout = () => {
  return (
    <>
      <UserNavbar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default UserLayout;