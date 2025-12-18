import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1b5e20",   // verde oscuro
      light: "#2e7d32",
      dark: "#003300"
    },
    secondary: {
      main: "#4caf50",
      light: "#81c784",
      dark: "#388e3c"
    },
    background: {
      default: "#0a1a0a",
      paper: "#102010"
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "#09320f",
        }
      }
    }
  }
});

export default theme;