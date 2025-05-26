import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <StyledWrapper>
      <div className="main_wrapper">
        <div className="main">
          <div className="antenna">
            <div className="antenna_shadow" />
            <div className="a1" />
            <div className="a1d" />
            <div className="a2" />
            <div className="a2d" />
            <div className="a_base" />
          </div>
          <div className="tv">
            <div className="cruve">
              <svg
                className="curve_svg"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 189.929 189.929"
                xmlSpace="preserve"
              >
                <path
                  d="M70.343,70.343c-30.554,30.553-44.806,72.7-39.102,115.635l-29.738,3.951C-5.442,137.659,11.917,86.34,49.129,49.13
        C86.34,11.918,137.664-5.445,189.928,1.502l-3.95,29.738C143.041,25.54,100.895,39.789,70.343,70.343z"
                />
              </svg>
            </div>
            <div className="display_div">
              <div className="screen_out">
                <div className="screen_out1">
                  <div className="screen">
                    <span className="notfound_text">NOT FOUND</span>
                  </div>
                  <div className="screenM">
                    <span className="notfound_text">NOT FOUND</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lines">
              <div className="line1" />
              <div className="line2" />
              <div className="line3" />
            </div>
            <div className="buttons_div">
              <div className="b1">
                <div />
              </div>
              <div className="b2" />
              <div className="speakers">
                <div className="g1">
                  <div className="g11" />
                  <div className="g12" />
                  <div className="g13" />
                </div>
                <div className="g" />
                <div className="g" />
              </div>
            </div>
          </div>
          <div className="bottom">
            <div className="base1" />
            <div className="base2" />
            <div className="base3" />
          </div>
        </div>
        <div className="text_404">
          <div className="text_4041">4</div>
          <div className="text_4042">0</div>
          <div className="text_4043">4</div>
        </div>
        <div className="button_wrapper">
          <button
            className="home_button"
            onClick={() => navigate("/")}
            aria-label="Voltar à página principal"
          >
            Voltar à página principal
          </button>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Design Inspired by one of Stefan Devai's Design on Dribble */
  height: 100vh;
  width: 100vw;
  background-color: #0d1117; /* Dark background consistent with app theme */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  .main_wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 30rem;
    height: auto;
    padding: 1rem;
  }

  .main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 20rem;
    margin-top: 2rem;
  }

  .antenna {
    width: 5rem;
    height: 5rem;
    border-radius: 50%;
    border: 2px solid black;
    background-color: #f27405;
    margin-bottom: -6rem;
    z-index: 1;
  }

  .antenna_shadow {
    position: absolute;
    background-color: transparent;
    width: 3.125rem;
    height: 3.5rem;
    margin-left: 1.05rem;
    border-radius: 45%;
    transform: rotate(140deg);
    border: 4px solid transparent;
    box-shadow: inset 0 1rem #a85103, inset 0 1rem 0.0625rem 0.0625rem #a85103;
  }

  .antenna::after {
    content: "";
    position: absolute;
    margin-top: -5.875rem;
    margin-left: 0.25rem;
    transform: rotate(-25deg);
    width: 0.625rem;
    height: 0.3125rem;
    border-radius: 50%;
    background-color: #f69e50;
  }

  .antenna::before {
    content: "";
    position: absolute;
    margin-top: 0.125rem;
    margin-left: 0.78125rem;
    transform: rotate(-20deg);
    width: 0.9375rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: #f69e50;
  }

  .a1 {
    position: relative;
    top: -102%;
    left: -130%;
    width: 7.5rem;
    height: 3.4375rem;
    border-radius: 3.125rem;
    background-image: linear-gradient(
      #171717,
      #171717,
      #353535,
      #353535,
      #171717
    );
    transform: rotate(-29deg);
    clip-path: polygon(50% 0%, 49% 100%, 52% 100%);
  }

  .a1d {
    position: relative;
    top: -211%;
    left: -35%;
    transform: rotate(45deg);
    width: 0.3125rem;
    height: 0.3125rem;
    border-radius: 50%;
    border: 2px solid black;
    background-color: #979797;
    z-index: 99;
  }

  .a2 {
    position: relative;
    top: -210%;
    left: -10%;
    width: 7.5rem;
    height: 2.5rem;
    border-radius: 3.125rem;
    background-image: linear-gradient(
      #171717,
      #171717,
      #353535,
      #353535,
      #171717
    );
    clip-path: polygon(
      47% 0,
      47% 0,
      34% 34%,
      54% 25%,
      32% 100%,
      29% 96%,
      49% 32%,
      30% 38%
    );
    transform: rotate(-8deg);
  }

  .a2d {
    position: relative;
    top: -294%;
    left: 94%;
    width: 0.3125rem;
    height: 0.3125rem;
    border-radius: 50%;
    border: 2px solid black;
    background-color: #979797;
    z-index: 99;
  }

  .notfound_text {
    background-color: black;
    padding: 0.3rem;
    font-size: 0.75rem;
    color: white;
    letter-spacing: 0;
    border-radius: 0.3125rem;
    z-index: 10;
    font-family: Montserrat, sans-serif;
  }

  .tv {
    width: 17rem;
    height: 9rem;
    margin-top: 3rem;
    border-radius: 0.9375rem;
    background-color: #d36604;
    display: flex;
    justify-content: center;
    border: 2px solid #1d0e01;
    box-shadow: inset 0.125rem 0.125rem #e69635;
  }

  .tv::after {
    content: "";
    position: absolute;
    width: 17rem;
    height: 9rem;
    border-radius: 0.9375rem;
    background: repeating-radial-gradient(
          #d36604 0 0.0001%,
          #00000070 0 0.0002%
        )
        50% 0/2500px 2500px,
      repeating-conic-gradient(#d36604 0 0.0001%, #00000070 0 0.0002%) 60% 60%/2500px
        2500px;
    background-blend-mode: difference;
    opacity: 0.09;
  }

  .curve_svg {
    position: absolute;
    margin-top: 0.25rem;
    margin-left: -0.25rem;
    height: 0.75rem;
    width: 0.75rem;
  }

  .display_div {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.9375rem;
    box-shadow: 0.21875rem 0.21875rem 0 #e69635;
  }

  .screen_out {
    width: auto;
    height: auto;
    border-radius: 0.625rem;
  }

  .screen_out1 {
    width: 11rem;
    height: 7.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.625rem;
  }

  .screen {
    width: 13rem;
    height: 7.85rem;
    border: 2px solid #1d0e01;
    background: repeating-radial-gradient(#000 0 0.0001%, #ffffff 0 0.0002%) 50%
        0/2500px 2500px,
      repeating-conic-gradient(#000 0 0.0001%, #ffffff 0 0.0002%) 60% 60%/2500px
        2500px;
    background-blend-mode: difference;
    animation: b 0.2s infinite alternate;
    border-radius: 0.625rem;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #252525;
    letter-spacing: 0.15rem;
    text-align: center;
    font-family: Montserrat, sans-serif;
  }

  .screenM {
    width: 13rem;
    height: 7.85rem;
    position: relative;
    background: linear-gradient(
      to right,
      #002fc6 0%,
      #002bb2 14.2857142857%,
      #3a3a3a 14.2857142857%,
      #303030 28.5714285714%,
      #ff0afe 28.5714285714%,
      #f500f4 42.8571428571%,
      #6c6c6c 42.8571428571%,
      #626262 57.1428571429%,
      #0affd9 57.1428571429%,
      #00f5ce 71.4285714286%,
      #3a3a3a 71.4285714286%,
      #303030 85.7142857143%,
      white 85.7142857143%,
      #fafafa 100%
    );
    border-radius: 0.625rem;
    border: 2px solid black;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #252525;
    letter-spacing: 0.15rem;
    text-align: center;
    font-family: Montserrat, sans-serif;
    overflow: hidden;
  }

  .screenM:before,
  .screenM:after {
    content: "";
    position: absolute;
    left: 0;
    z-index: 1;
    width: 100%;
  }

  .screenM:before {
    top: 0;
    height: 68.4782608696%;
    background: linear-gradient(
      to right,
      white 0%,
      #fafafa 14.2857142857%,
      #ffe60a 14.2857142857%,
      #f5dc00 28.5714285714%,
      #0affd9 28.5714285714%,
      #00f5ce 42.8571428571%,
      #10ea00 42.8571428571%,
      #0ed600 57.1428571429%,
      #ff0afe 57.1428571429%,
      #f500f4 71.4285714286%,
      #ed0014 71.4285714286%,
      #d90012 85.7142857143%,
      #002fc6 85.7142857143%,
      #002bb2 100%
    );
  }

  .screenM:after {
    bottom: 0;
    height: 21.7391304348%;
    background: linear-gradient(
      to right,
      #006c6b 0%,
      #005857 16.6666666667%,
      white 16.6666666667%,
      #fafafa 33.3333333333%,
      #001b75 33.3333333333%,
      #001761 50%,
      #6c6c6c 50%,
      #626262 66.6666666667%,
      #929292 66.6666666667%,
      #888888 83.3333333333%,
      #3a3a3a 83.3333333333%,
      #303030 100%
    );
  }

  @keyframes b {
    100% {
      background-position: 50% 0, 60% 50%;
    }
  }

  .lines {
    display: flex;
    column-gap: 0.1rem;
    align-self: flex-end;
  }

  .line1,
  .line3 {
    width: 0.125rem;
    height: 0.5rem;
    background-color: black;
    border-radius: 1.5625rem 1.5625rem 0 0;
    margin-top: 0.5rem;
  }

  .line2 {
    flex-grow: 1;
    width: 0.125rem;
    height: 1rem;
    background-color: black;
    border-radius: 1.5625rem 1.5625rem 0 0;
  }

  .buttons_div {
    width: 4.25rem;
    height: 8rem;
    background-color: #e69635;
    border: 2px solid #1d0e01;
    padding: 0.6rem;
    border-radius: 0.625rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    row-gap: 0.75rem;
    box-shadow: 0.1875rem 0.1875rem 0 #e69635;
  }

  .b1 {
    width: 1.65rem;
    height: 1.65rem;
    border-radius: 50%;
    background-color: #7f5934;
    border: 2px solid black;
    box-shadow: inset 0.125rem 0.125rem 0.0625rem #b49577, -0.125rem 0 #513721,
      -0.125rem 0 0 0.0625rem black;
  }

  .b1::before {
    content: "";
    position: absolute;
    margin-top: 1rem;
    margin-left: 0.3125rem;
    transform: rotate(47deg);
    border-radius: 0.3125rem;
    width: 0.0625rem;
    height: 0.25rem;
    background-color: #000000;
  }

  .b1::after {
    content: "";
    position: absolute;
    margin-top: 0.5625rem;
    margin-left: 0.5rem;
    transform: rotate(47deg);
    border-radius: 0.3125rem;
    width: 0.0625rem;
    height: 0.34375rem;
    background-color: #000000;
  }

  .b1 div {
    position: absolute;
    margin-top: -0.0625rem;
    margin-left: 0.40625rem;
    transform: rotate(45deg);
    width: 0.09375rem;
    height: 0.9375rem;
    background-color: #000000;
  }

  .b2 {
    width: 1.65rem;
    height: 1.65rem;
    border-radius: 50%;
    background-color: #7f5934;
    border: 2px solid black;
    box-shadow: inset 0.125rem 0.125rem 0.0625rem #b49577, -0.125rem 0 #513721,
      -0.125rem 0 0 0.0625rem black;
  }

  .b2::before {
    content: "";
    position: absolute;
    margin-top: 0.65625rem;
    margin-left: 0.5rem;
    transform: rotate(-45deg);
    border-radius: 0.3125rem;
    width: 0.09375rem;
    height: 0.25rem;
    background-color: #000000;
  }

  .b2::after {
    content: "";
    position: absolute;
    margin-top: -0.0625rem;
    margin-left: 0.40625rem;
    transform: rotate(-45deg);
    width: 0.09375rem;
    height: 0.9375rem;
    background-color: #000000;
  }

  .speakers {
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
  }

  .speakers .g1 {
    display: flex;
    column-gap: 0.25rem;
  }

  .speakers .g1 .g11,
  .g12,
  .g13 {
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 50%;
    background-color: #7f5934;
    border: 2px solid black;
    box-shadow: inset 0.078125rem 0.078125rem 0.0625rem #b49577;
  }

  .speakers .g {
    width: auto;
    height: 0.125rem;
    background-color: #171717;
  }

  .bottom {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 5.4375rem;
  }

  .base1,
  .base2 {
    height: 1rem;
    width: 2rem;
    border: 2px solid #171717;
    background-color: #4d4d4d;
    margin-top: -0.15rem;
    z-index: -1;
  }

  .base3 {
    position: absolute;
    height: 0.15rem;
    width: 17.5rem;
    background-color: #171717;
    margin-top: 0.8rem;
  }

  .text_404 {
    display: flex;
    flex-direction: row;
    column-gap: 2rem;
    margin-top: 1rem;
    align-items: center;
    justify-content: center;
    font-family: Montserrat, sans-serif;
    color: #ffffff;
    opacity: 0.8;
  }

  .text_4041,
  .text_4042,
  .text_4043 {
    font-size: 4rem;
    font-weight: bold;
    transform: scaleY(1) scaleX(1);
  }

  .button_wrapper {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  .home_button {
    background-color: #1e3a8a; /* bg-azul-escuro */
    color: #ffffff;
    font-family: Montserrat, sans-serif;
    font-size: 1rem;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }

  .home_button:hover {
    background-color: #3b82f6; /* bg-azul-claro */
    transform: translateY(-0.125rem);
  }

  .home_button:active {
    transform: translateY(0);
  }

  /* Responsive Adjustments */
  @media only screen and (max-width: 640px) {
    .main_wrapper {
      max-width: 24rem;
    }

    .main {
      max-width: 16rem;
    }

    .tv {
      width: 14rem;
      height: 7.5rem;
    }

    .tv::after {
      width: 14rem;
      height: 7.5rem;
    }

    .screen_out1 {
      width: 9rem;
      height: 6.25rem;
    }

    .screen,
    .screenM {
      width: 10rem;
      height: 6.35rem;
    }

    .notfound_text {
      font-size: 0.625rem;
    }

    .text_404 {
      column-gap: 1.5rem;
    }

    .text_4041,
    .text_4042,
    .text_4043 {
      font-size: 3rem;
    }

    .buttons_div {
      width: 3.5rem;
      height: 6.5rem;
    }

    .bottom {
      column-gap: 4rem;
    }

    .base3 {
      width: 14rem;
    }
  }

  @media only screen and (max-width: 480px) {
    .main_wrapper {
      max-width: 20rem;
    }

    .main {
      max-width: 14rem;
    }

    .tv {
      width: 12rem;
      height: 6.5rem;
    }

    .tv::after {
      width: 12rem;
      height: 6.5rem;
    }

    .screen_out1 {
      width: 7.5rem;
      height: 5.25rem;
    }

    .screen,
    .screenM {
      width: 8.5rem;
      height: 5.35rem;
    }

    .notfound_text {
      font-size: 0.5rem;
    }

    .text_404 {
      column-gap: 1rem;
    }

    .text_4041,
    .text_4042,
    .text_4043 {
      font-size: 2.5rem;
    }

    .buttons_div {
      width: 3rem;
      height: 5.5rem;
    }

    .bottom {
      column-gap: 3rem;
    }

    .base3 {
      width: 12rem;
    }

    .home_button {
      padding: 0.625rem 1.25rem;
      font-size: 0.875rem;
    }
  }

  @media only screen and (max-width: 1024px) {
    .screenM {
      display: flex;
    }
    .screen {
      display: none;
    }
  }

  @media only screen and (min-width: 1025px) {
    .screen {
      display: flex;
    }
    .screenM {
      display: none;
    }
  }
`;

export default NotFound;
