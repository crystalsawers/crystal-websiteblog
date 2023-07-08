import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown
} from "reactstrap";
import Login from "./Login";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const navbar = { backgroundColor: '#189BCC' };

  return (
    <Router>
      <Navbar style={navbar} expand="md" dark>
        <NavbarBrand href="/">Crystal's blog</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="ms-auto" navbar>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Categories
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem href="/option1">Option 1</DropdownItem>
                <DropdownItem href="/option2">Option 2</DropdownItem>
                <DropdownItem divider />
                <DropdownItem href="/">Back to Homepage</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <NavItem>
              <NavLink href="/login">Login</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default Navigation;
