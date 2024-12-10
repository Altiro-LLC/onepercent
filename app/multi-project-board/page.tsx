"use client";

import React from "react";
import MultiProjectBoard from "../../components/home";
import { Provider } from "react-redux";
import store from "../store/store";

const MultiProjectBoardPage = () => {
  return (
    <Provider store={store}>
      <div>
        <MultiProjectBoard />
      </div>
    </Provider>
  );
};

export default MultiProjectBoardPage;
