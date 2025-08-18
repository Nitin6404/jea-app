// styles/commonStyles.ts
import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181818", // default background
    paddingHorizontal: 40,
    justifyContent: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: "400",
    color: "#aaa",
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#D28A8C",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  inputWrapper: {
    marginVertical: 10,
  },
  forwardIconBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: "#D28A8C",
  },
});
