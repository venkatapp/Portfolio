import React, { useState, useEffect } from 'react';
import './navbar.css';
import { Navbar, Container, Nav, Offcanvas} from 'react-bootstrap';
//logo
import BlockLogo from '../../assets/logo-block.jpeg';
import WhiteLogo from '../../assets/logo.jpeg';


function AppNavbar() {
    const expand = 'lg'; // Or 'sm', 'md', 'xl', 'xxl', or false
    const [navbarLogo, setNavbarLogo]=useState(WhiteLogo)
    const [navbar, setNavbar]=useState(false);  

    const changeBackground=()=>{
      // console.log(window.scrollY)
      if(window.scrollY >=66){
        setNavbar(true)
      }else{
        setNavbar(false)
      }
    }
  useEffect(() => {
    changeBackground()
    // adding the event when scroll change background
    window.addEventListener("scroll", changeBackground)
  })

  //logo scroll function
  const changeLogo = () => {
    if (window.scrollY >= 60) {
      setNavbarLogo(BlockLogo)
    } else {
      setNavbarLogo(BlockLogo)
    }
  }

  useEffect(() => {
    changeLogo()
    // adding the event when scroll change Logo
    window.addEventListener("scroll", changeLogo)
  })


  return (
   <Navbar key={expand} expand={expand} className={`mb-3 ${navbar ? 'navbar scrolled':'navbar'} navbar-expand-lg navbar-dark fixed-top`} id="main-nav">
      <Container>
        <Navbar.Brand href="#home">   
        <img src={navbarLogo} alt='KreativeHussain' />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
        <Navbar.Offcanvas
          id={`offcanvasNavbar-expand-${expand}`}
          aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`} 
          placement="end" // Can be 'start', 'end', 'top', or 'bottom'
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
              Offcanvas
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3" id="navbar-example2">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#about">About</Nav.Link>
              <Nav.Link href="#skills">Skills</Nav.Link>
              <Nav.Link href="#projects">Projects</Nav.Link>
              <Nav.Link href="#contact">Contact</Nav.Link>
              {/* Add more Nav.Link or NavDropdown components as needed */}
            </Nav>
            {/* You can also place forms or other content here */}
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
