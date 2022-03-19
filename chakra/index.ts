import { ButtonProps } from '@chakra-ui/react';


export const signUpBtnStyle: ButtonProps = {
    height: '100%',
    borderRadius: '5px',
    backgroundColor: 'var(--app-btn-bgcolor)',
    color: 'var(--app-btn-color)',
    padding: 'var(--app-navbar-authbtn-padding)',
    fontWeight: 'normal',
    fontSize: 'var(--app-fontsize)',
    _hover: {
        backgroundColor: 'var(--app-btn-bgcolor--hover)',
    },
    _active: {
        backgroundColor: 'var(--app-btn-bgcolor--active)',
    },
    _focus: {
        boxShadow: 'none',
    },
};

export const signInBtnStyle: ButtonProps = {
    height: '100%',
    color: 'var(--app-btn-bgcolor)',
    padding: 'var(--app-navbar-authbtn-padding)',
    fontWeight: '600',
    fontSize: 'var(--app-fontsize)',
    _active: {
        color: 'var(--app-btn-bgcolor)',
    },
    _focus: {
        boxShadow: 'none',
    },
};

export const LinkBtnStyle: ButtonProps = {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: 'black',
    paddingLeft: '25px',
    paddingRight: '25px',
    fontWeight: '600',
    fontSize: 'var(--app-fontsize)',
    _hover: {
        textDecoration: 'none',
    },
    _focus: {
        boxShadow: 'none',
    },
};

export const MenuBtnStyle: ButtonProps = {
    height: '100%',
    minWidth: '10px',
    backgroundColor: 'transparent',
    paddingLeft: '0',
    paddingRight: '0',
    fontSize: 'var(--app-fontsize)',
    // transform: 'rotateZ(180deg)',
    _hover: {
        backgroundColor: 'transparent',
    },
    _active: {
        backgroundColor: 'transparent',
    },
    _focus: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
    },
};