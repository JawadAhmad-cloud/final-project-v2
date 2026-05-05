import { Outlet } from "react-router-dom";
import SellerNavbar from "../components/SellerNavbar";
import UserNavbar from "../components/UserNavbar";

const SellerLayout = () => {
  return (
    <>
      <UserNavbar />
      <div className="flex flex-row">
        <SellerNavbar />
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default SellerLayout;
