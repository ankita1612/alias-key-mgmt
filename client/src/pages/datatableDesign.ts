export const customTableStyles = {
  headRow: {
    style: {
      backgroundColor: "#ffffff",
      color: "#000000",
      fontWeight: 600,
      fontSize: "15px",
      height: "50px",
    },
  },
  rows: {
    style: {
      fontSize: "14px",
      minHeight: "52px", // 👈 slightly taller (default ~48)

      backgroundColor: "#ffffff",
      "&:hover": {
        backgroundColor: "#f3f4f6",
        cursor: "pointer",
      },
    },
    stripedStyle: {
      backgroundColor: "#ffffff",
    },
  },
  cells: {
    style: {
      fontSize: "14px", // 👈 subtle increase (best sweet spot)
      lineHeight: "1.5", // 👈 improves readability
      paddingTop: "10px",
      paddingBottom: "10px",
    },
  },
  pagination: {
    style: {
      minHeight: "56px",
    },
  },
  noData: {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#ffffff",
      minHeight: "300px",
    },
  },
};
