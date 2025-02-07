import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { updateLectureInfo } from "../../redux/actions";
import audio1 from "./a1.mp3";
import audio2 from "./a2.mp3";
import audio3 from "./a3.mp3";
import audio4 from "./a4.mp3";
import audio5 from "./a5.mp3";
import "./lecture.css"; // Import CSS file

export default function Lecture({ onCompletion }) {
  const [lectureStarted, setLectureStarted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [audioTimer, setAudioTimer] = useState(0);
  const [pageAudio, setPageAudio] = useState([
    { id: 0, val: 0 },
    { id: 1, val: 0 },
    { id: 2, val: 0 },
    { id: 3, val: 0 },
    { id: 4, val: 0 },
  ]);
  const [pageText, setPageText] = useState([
    { id: 0, val: 0 },
    { id: 1, val: 0 },
    { id: 2, val: 0 },
    { id: 3, val: 0 },
    { id: 4, val: 0 },
  ]);
  const [textTimer, setTextTimer] = useState(0);
  const [totalTimer, setTotalTimer] = useState(0);
  const [mode, setMode] = useState("audio"); // State to track the current mode (audio or text)
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const nextButtonsRefs = useRef([]);
  const endLectureButtonRef = useRef(null);
  const [audioPlayEvents, setAudioPlayEvents] = useState([]);
  let playNo = 0;
  let pauseNo = 0;
  const playButtonRef = useRef(null);
  const nextButtonRef = useRef(null);
  const replayButtonRef = useRef(null)
  const [currentAudioFile, setCurrentAudioFile] = useState(1);

  const handleAudioPause = () => {
    const currentTime = audioRef.current ? audioRef.current.currentTime : 0;
    const word = findWordAtTimestamp(currentTime, currentPage);
    const pauseString = `Audio ${currentAudioFile} - pause at ${Math.floor(currentTime)}s (word: "${word}")`;
    setAudioPlayEvents((prevEvents) => [...prevEvents, pauseString]);
  };

// Update handleAudioPlay
const handleAudioPlay = () => {
  const currentTime = audioRef.current ? audioRef.current.currentTime : 0;
  const playString = `Audio ${currentAudioFile} - play at ${Math.floor(currentTime)}s`;
  setAudioPlayEvents((prevEvents) => [...prevEvents, playString]);
};

  const pageContent = [
    <div>
      Introduction to Financial Literacy
      <br />
      1. Understanding Basic Financial Concepts Definitions: Money: Money is a
      recognised medium of exchange in the economy. It is an asset that can be
      stored and used in the form of currency or as value. Currency: Currency is
      the physical form of money in the form of coins and rupees. Each country
      typically has its own currency as a medium of exchange issued by the
      central bank. In India, the Government of India (GoI) and Reserve Bank of
      India (RBI) are the issuers of the currency, i.e. Indian Rupees Bank: A
      bank is a government-authorised financial institution which acts as a
      custodian of money deposited by account holders and uses the collected
      funds to extend loans to individuals and businesses while charging
      interest on the same. Account: An account is a repository of the funds
      held by a bank on behalf of the account holder. An account can be of
      various kinds, and is identified by a unique account number issued to the
      account holder. Saving: Savings is the amount of money that is remaining
      from income, after the expenses are made. Investment: An investment refers
      to an asset acquired with the objective of generating income or
      appreciation. Paragraph: When you accompany your parents to the market, do
      you observe how they purchase the various items? Every purchase requires
      the use of money. As you are able to observe, money is the accepted medium
      of exchange. It allows you to buy the things you require, right from basic
      things such as bread to high-value products such as a car. In our country,
      money is used in the form of Indian currency known as ‘Rupee’. You would
      surely have used ‘rupees’ when you buy food from the school canteen.
    </div>,
    <div>
      2. Barter System Historically speaking, humans have been transacting in
      goods much before money was invented. Have you ever wondered how these
      transactions took place? The answer is ‘Barter System’. To understand the
      Barter System in a simple manner, consider this example: Satya has two
      bags of wheat at his home; however, he needs only one of them for his
      monthly consumption. On the other hand, Ahmad has two bags of rice out of
      which he is able to spare one. So they meet and decide to exchange the bag
      of wheat with that of rice. After the barter exchange, Satya and Ahmad
      both have one bag of rice and wheat each to match their requirement of
      food. Have you ever performed a simple barter exchange with your friend or
      cousin? For example, you have a pack of sketch pens that you do not need,
      and you exchange the same for a geometry box?
    </div>,
    <div>
      3. Needs and Wants To better understand the Barter System, it is important
      to know the meaning of ‘Needs’ and ‘Wants’. In the Satya-Ahmad example, we
      can see that while Satya needs rice to meet the food requirements of his
      family, Ahmad needs a bag of wheat for the same purpose. However, rice and
      wheat are not their ‘wants’. Let us try to understand the same through
      another example. When you feel hungry, you need food to satisfy your
      hunger. Therefore, food is your need. However, when you visit the market
      with your father and you feel tempted to have ice cream. In this
      situation, ice cream is not your ‘need.’ However, it is your ‘want.’
      ‘Needs’ are the essential requirements in our life such as food, clothes
      and house. On the other hand, ‘Wants’ are for the things you require to
      enhance the quality of your life, such as games, music and TVs.
    </div>,
    <div>
      4. Evolution of Trade Let us start by understanding the definition of
      trade. Trade is a financial activity that includes buying and selling
      various goods and services between two or more people involved in the
      transaction. Trade can happen between organisations and countries as well.
      For example, India primarily exports products such as rice and jewellery,
      and imports petroleum and electronic components. The evolution of trade
      across the world has been closely linked with the development of the money
      system. You would be surprised to know that trade across continents has
      been prevalent in our world, even in ancient times. While ancient trade
      was based on the barter system, there is also evidence of commodities
      being used in the form of livestock, salt, metal, rare stones et cetera.
      Pottery traditions were popular in parts of the world such as Japan,
      Korea, China, Mexico and many more. The Han Dynasty, which ruled China
      from 206 BC to 220 AD, opened up the ‘Silk Road’ trading route between
      China and Central Asia. Various kinds of merchandise travelled along the
      Silk Road, making it one of the oldest routes of international trade in
      the world. The first non-stop voyages from Egypt to India were initiated
      at the start of the Common Era. Spices from India came in demand around
      the world and were the main exports to the western world. The spice trade
      led to new diplomatic relationships between East and West. It was partly
      with the spice trade in mind that Christopher set out in 1492 and
      discovered America.
    </div>,
    <div>
      Summary
      <br />• Money is a recognised medium of exchange in the economy. • A bank
      is a government-authorised financial institution which acts as a custodian
      of money deposited by account holders • Historically speaking, humans have
      been transacting in goods much before money was invented • While ancient
      trade was based on the barter system, there is also evidence of
      commodities being used in the form of livestock, salt, metal, rare stones
      et cetera. • The Han Dynasty, which ruled China from 206 BC to 220 AD,
      opened up the ‘Silk Road’ trading route between China and Central Asia.
    </div>,
  ];

  // Add transcript dictionaries for each audio file
const transcripts = [
  {'0.0s': ' Introduction', '0.72s': ' to', '0.88s': ' financial', '1.18s': ' literacy', '2.520000000000003s': ' 1.', '3.6s': ' Understanding', '4.12s': ' basic', '4.5s': ' financial', '5.08s': ' concepts', '7.080000000000003s': ' Definitions', '8.360000000000003s': ' Money', '9.660000000000004s': ' Money', '10.3s': ' is', '10.5s': ' a', '10.6s': ' recognized', '11.04s': ' medium', '11.5s': ' of', '11.7s': ' exchange', '12.0s': ' in', '12.24s': ' the', '12.36s': ' economy', '13.72s': ' It', '14.04s': ' is', '14.14s': ' an', '14.3s': ' asset', '14.62s': ' that', '14.86s': ' can', '15.04s': ' be', '15.18s': ' stored', '15.52s': ' and', '15.84s': ' used', '16.08s': ' in', '16.24s': ' the', '16.34s': ' form', '16.52s': ' of', '16.72s': ' currency', '17.12s': ' or', '17.52s': ' as', '17.7s': ' value', '18.860000000000003s': ' currency', '20.200000000000003s': ' currency', '20.84s': ' is', '21.36s': ' the', '21.5s': ' physical', '21.88s': ' form', '22.18s': ' of', '22.32s': ' money', '22.62s': ' in', '22.94s': ' the', '23.04s': ' form', '23.22s': ' of', '23.48s': ' coins', '23.74s': ' and', '24.16s': ' rupees', '25.340000000000007s': ' each', '25.98s': ' country', '26.36s': ' typically', '26.88s': ' has', '27.12s': ' its', '27.28s': ' own', '27.5s': ' currency', '27.96s': ' as', '28.32s': ' a', '28.44s': ' medium', '28.68s': ' of', '28.9s': ' exchange', '29.24s': ' issued', '29.8s': ' by', '29.98s': ' the', '30.08s': ' central', '30.4s': ' bank', '31.640000000000004s': ' In', '31.96s': ' India,', '32.56s': ' the', '32.64s': ' government', '32.92s': ' of', '33.18s': ' India,', '33.8s': ' Goy,', '34.4s': ' and', '34.5s': ' Reserve', '34.7s': ' Bank', '35.0s': ' of', '35.2s': ' India,', '35.9s': ' RBI', '36.28s': ' are', '36.88s': ' the', '37.04s': ' issuers', '37.44s': ' of', '37.56s': ' the', '37.66s': ' currency', '38.1s': ' i', '38.58s': '.e.', '38.8s': ' Indian', '39.08s': ' Rupees', '40.620000000000005s': ' Bank', '40.94s': ' A', '41.4s': ' bank', '41.68s': ' is', '41.84s': ' a', '41.92s': ' government', '42.22s': ' authorized', '42.78s': ' financial', '43.18s': ' institution', '44.02s': ' which', '44.46s': ' acts', '44.74s': ' as', '44.94s': ' a', '45.06s': ' custodian', '45.6s': ' of', '45.74s': ' money', '45.94s': ' deposited', '46.5s': ' by', '46.76s': ' account', '47.08s': ' holders', '47.52s': ' and', '47.92s': ' uses', '48.18s': ' the', '48.38s': ' collected', '48.7s': ' funds', '49.12s': ' to', '49.38s': ' extend', '49.72s': ' loans', '50.02s': ' to', '50.34s': ' individuals', '50.78s': ' and', '51.08s': ' businesses', '51.58s': ' while', '52.08s': ' charging', '52.46s': ' interest', '52.86s': ' on', '53.08s': ' the', '53.2s': ' same', '54.5s': ' account', '55.62s': ' An', '56.18s': ' account', '56.52s': ' is', '56.74s': ' a', '56.82s': ' repository', '57.38s': ' of', '57.64s': ' the', '57.72s': ' funds', '58.04s': ' held', '58.26s': ' by', '58.46s': ' a', '58.58s': ' bank', '58.82s': ' on', '59.06s': ' behalf', '59.32s': ' of', '59.52s': ' the', '59.64s': ' account', '59.92s': ' holder', '60.94s': ' An', '61.5s': ' account', '61.86s': ' can', '62.04s': ' be', '62.2s': ' of', '62.3s': ' various', '62.62s': ' kinds', '63.06s': ' and', '63.6s': ' is', '63.74s': ' identified', '64.2s': ' by', '64.5s': ' a', '64.62s': ' unique', '64.86s': ' account', '65.32s': ' number', '65.62s': ' issued', '65.9s': ' to', '66.12s': ' the', '66.24s': ' account', '66.52s': ' holder', '67.78s': ' Saving', '69.28s': ' Saving', '69.84s': ' is', '70.04s': ' the', '70.24s': ' amount', '70.48s': ' of', '70.68s': ' money', '70.94s': ' that', '71.14s': ' is', '71.3s': ' remaining', '71.58s': ' from', '71.86s': ' income', '72.24s': ' after', '72.78s': ' the', '72.96s': ' expenses', '73.36s': ' are', '73.58s': ' made', '74.82s': ' Investment', '75.38s': ' An', '75.94s': ' investment', '76.38s': ' refers', '76.76s': ' to', '77.06s': ' an', '77.22s': ' asset', '77.5s': ' acquired', '77.94s': ' with', '78.16s': ' the', '78.28s': ' objective', '78.66s': ' of', '78.88s': ' generating', '79.26s': ' income', '79.78s': ' or', '80.1s': ' appreciation', '82.03999999999999s': ' Paragraph', '83.24000000000001s': ' When', '83.72s': ' you', '83.88s': ' accompany', '84.24s': ' your', '84.46s': ' parents', '84.76s': ' to', '84.98s': ' the', '85.06s': ' market,', '85.82s': ' do', '85.88s': ' you', '85.98s': ' observe', '86.3s': ' how', '86.52s': ' they', '86.64s': ' purchase', '86.94s': ' the', '87.16s': ' various', '87.46s': ' items', '88.78s': ' Every', '89.26s': ' purchase', '89.62s': ' requires', '90.1s': ' the', '90.36s': ' use', '90.52s': ' of', '90.72s': ' money', '91.70000000000002s': ' As', '92.18s': ' you', '92.32s': ' are', '92.44s': ' able', '92.66s': ' to', '92.84s': ' observe,', '93.58s': ' money', '93.8s': ' is', '93.98s': ' the', '94.12s': ' accepted', '94.54s': ' medium', '94.92s': ' of', '95.1s': ' exchange', '96.38s': ' It', '96.86s': ' allows', '97.1s': ' you', '97.34s': ' to', '97.46s': ' buy', '97.6s': ' the', '97.76s': ' things', '97.98s': ' you', '98.16s': ' require', '98.62s': ' right', '99.16s': ' from', '99.38s': ' basic', '99.74s': ' things', '100.06s': ' such', '100.4s': ' as', '100.5s': ' bread', '100.72s': ' to', '100.9s': ' high', '101.06s': '-value', '101.32s': ' products', '101.84s': ' such', '102.3s': ' as', '102.46s': ' a', '102.54s': ' car', '103.53999999999999s': ' In', '104.02s': ' our', '104.14s': ' country,', '104.86s': ' money', '105.1s': ' is', '105.3s': ' used', '105.52s': ' in', '105.64s': ' the', '105.74s': ' form', '105.94s': ' of', '106.16s': ' Indian', '106.38s': ' currency', '106.92s': ' known', '107.32s': ' as', '107.6s': ' Rupi', '108.0s': ' You', '108.38s': ' would', '108.52s': ' surely', '108.84s': ' have', '109.06s': ' used', '109.36s': ' rupees', '109.74s': ' when', '110.32s': ' you', '110.44s': ' buy', '110.58s': ' food', '110.9s': ' from', '111.12s': ' the', '111.24s': ' school', '111.48s': ' canteen', '112.6s': ' Your', '112.98s': ' housell'}, // Audio 1
  {'0.0s': ' 2.', '0.68s': ' Barter', '0.92s': ' System', '1.42s': ' Historically', '3.04s': ' speaking,', '3.9s': ' humans', '4.14s': ' have', '4.36s': ' been', '4.52s': ' transacting', '5.12s': ' in', '5.38s': ' goods', '5.56s': ' much', '5.82s': ' before', '6.16s': ' money', '6.56s': ' was', '6.76s': ' invented.', '7.88s': ' Have', '8.4s': ' you', '8.52s': ' ever', '8.74s': ' wondered', '9.04s': ' how', '9.24s': ' these', '9.4s': ' transactions', '9.94s': ' took', '10.28s': ' place?', '11.64s': ' The', '11.88s': ' answer', '12.2s': ' is', '12.42s': ' Barter', '12.78s': ' System.', '14.04s': ' To', '14.4s': ' understand', '14.84s': ' the', '15.04s': ' Barter', '15.34s': ' System', '15.72s': ' in', '15.88s': ' a', '15.98s': ' simple', '16.24s': ' matter,', '16.92s': ' consider', '17.24s': ' this', '17.5s': ' example.', '19.16s': ' Satya', '19.56s': ' has', '19.8s': ' two', '20.0s': ' bags', '20.22s': ' of', '20.5s': ' weed', '20.6s': ' at', '20.76s': ' his', '20.96s': ' home,', '21.5s': ' however,', '22.3s': ' he', '22.4s': ' needs', '22.6s': ' only', '22.88s': ' one', '23.14s': ' of', '23.22s': ' them', '23.38s': ' for', '23.56s': ' his', '23.74s': ' monthly', '24.06s': ' consumption.', '25.42s': ' On', '25.94s': ' the', '26.08s': ' other', '26.24s': ' hand,', '26.8s': ' Amat', '27.08s': ' has', '27.22s': ' two', '27.44s': ' bags', '27.7s': ' of', '27.96s': ' rice', '28.16s': ' out', '28.54s': ' of', '28.62s': ' which', '28.8s': ' he', '28.98s': ' is', '29.12s': ' able', '29.3s': ' to', '29.46s': ' spare', '29.7s': ' one.', '30.92s': ' So', '31.22s': ' they', '31.34s': ' meet', '31.56s': ' and', '31.84s': ' decide', '32.12s': ' to', '32.36s': ' exchange', '32.66s': ' the', '32.98s': ' bag', '33.16s': ' of', '33.38s': ' wheat', '33.54s': ' with', '33.84s': ' that', '33.96s': ' of', '34.12s': ' rice.', '35.28s': ' After', '35.8s': ' the', '35.96s': ' Barter', '36.22s': ' Exchange,', '37.32s': ' Satya', '37.74s': ' and', '38.08s': ' Amad', '38.44s': ' both', '38.82s': ' have', '38.98s': ' one', '39.2s': ' bag', '39.44s': ' of', '39.64s': ' rice', '39.88s': ' and', '40.3s': ' wheat', '40.52s': ' each', '40.86s': ' to', '41.26s': ' match', '41.44s': ' their', '41.7s': ' requirement', '42.14s': ' of', '42.34s': ' food.', '43.54s': ' Have', '43.86s': ' you', '44.0s': ' ever', '44.22s': ' performed', '44.58s': ' a', '44.76s': ' simple', '45.02s': ' Barter', '45.4s': ' Exchange', '45.72s': ' with', '46.02s': ' your', '46.16s': ' friend', '46.46s': ' or', '46.74s': ' cousin?', '47.88s': ' For', '48.36s': ' example,', '49.22s': ' you', '49.34s': ' have', '49.48s': ' a', '49.56s': ' pack', '49.8s': ' of', '49.98s': ' sketch', '50.18s': ' pens', '50.52s': ' that', '50.76s': ' you', '50.9s': ' do', '51.02s': ' not', '51.22s': ' need', '51.56s': ' and', '51.98s': ' you', '52.12s': ' exchange', '52.44s': ' the', '52.72s': ' same', '52.96s': ' for', '53.16s': ' a', '53.34s': ' geometry', '53.72s': ' box.'}, // Audio 2
  {'0.0s': ' 3.', '0.72s': ' Needs', '0.96s': ' and', '1.1s': ' Wants', '2.1799999999999997s': ' To', '2.66s': ' better', '2.86s': ' understand', '3.34s': ' the', '3.56s': ' barter', '3.84s': ' system,', '4.6s': ' it', '4.7s': ' is', '4.82s': ' important', '5.24s': ' to', '5.44s': ' know', '5.58s': ' the', '5.74s': ' meaning', '5.94s': ' of', '6.18s': ' needs', '6.4s': ' and', '6.7s': ' wants.', '8.06s': ' In', '8.3s': ' the', '8.44s': ' Satyamad', '9.1s': ' example,', '9.98s': ' we', '10.12s': ' can', '10.28s': ' see', '10.5s': ' that', '10.66s': ' while', '10.8s': ' Satyam', '11.34s': ' needs', '11.6s': ' rice', '11.88s': ' to', '12.14s': ' meet', '12.3s': ' the', '12.46s': ' food', '12.66s': ' requirements', '13.16s': ' of', '13.42s': ' his', '13.54s': ' family,', '14.28s': ' a', '14.34s': ' mod', '14.52s': ' needs', '14.76s': ' a', '14.94s': ' bag', '15.08s': ' of', '15.34s': ' wheat', '15.48s': ' for', '15.74s': ' the', '15.86s': ' same', '16.1s': ' purpose.', '17.52s': ' However,', '18.44s': ' rice', '18.6s': ' and', '18.98s': ' wheat', '19.22s': ' are', '19.48s': ' not', '19.66s': ' their', '19.86s': ' wants.', '21.36s': ' Let', '21.58s': ' us', '21.7s': ' try', '21.9s': ' to', '22.04s': ' understand', '22.46s': ' the', '22.7s': ' same', '22.92s': ' through', '23.14s': ' another', '23.38s': ' example.', '24.64s': ' When', '25.12s': ' you', '25.24s': ' feel', '25.46s': ' hungry,', '26.16s': ' you', '26.26s': ' need', '26.4s': ' food', '26.66s': ' to', '26.84s': ' satisfy', '27.3s': ' your', '27.54s': ' hunger.', '28.760000000000005s': ' Therefore,', '29.76s': ' food', '29.9s': ' is', '30.1s': ' your', '30.22s': ' need.', '31.320000000000004s': ' However,', '32.3s': ' when', '32.44s': ' you', '32.56s': ' visit', '32.8s': ' the', '32.98s': ' market', '33.26s': ' with', '33.46s': ' your', '33.6s': ' father', '34.0s': ' and', '34.36s': ' you', '34.48s': ' feel', '34.66s': ' tempted', '35.04s': ' to', '35.24s': ' have', '35.4s': ' ice', '35.54s': ' cream.', '36.68s': ' In', '37.06s': ' this', '37.2s': ' situation,', '38.1s': ' ice', '38.24s': ' cream', '38.48s': ' is', '38.66s': ' not', '38.82s': ' your', '39.0s': ' need.', '40.3s': ' However,', '40.98s': ' it', '41.08s': ' is', '41.22s': ' your', '41.34s': ' want.', '42.88s': ' Needs', '43.2s': ' are', '43.4s': ' the', '43.52s': ' essential', '43.9s': ' requirements', '44.44s': ' in', '44.7s': ' our', '44.82s': ' life', '45.08s': ' such', '45.38s': ' as', '45.54s': ' food,', '46.16s': ' clothes,', '46.72s': ' and', '46.84s': ' house.', '47.88s': ' On', '48.4s': ' the', '48.54s': ' other', '48.7s': ' hand,', '49.38s': ' wants', '49.58s': ' are', '49.7s': ' for', '49.84s': ' the', '49.96s': ' things', '50.2s': ' you', '50.36s': ' require', '50.72s': ' to', '51.02s': ' enhance', '51.26s': ' the', '51.52s': ' quality', '51.86s': ' of', '52.06s': ' your', '52.16s': ' life,', '52.86s': ' such', '53.12s': ' as', '53.26s': ' games,', '53.94s': ' music,', '54.44s': ' and', '54.54s': ' TVs.'}, // Audio 3
  {'0.0s': ' 4.', '0.8s': ' Evolution', '1.1s': ' of', '1.42s': ' Trade', '2.64s': ' Let', '2.98s': ' us', '3.1s': ' start', '3.44s': ' by', '3.76s': ' understanding', '4.32s': ' the', '4.58s': ' definition', '4.96s': ' of', '5.24s': ' trade.', '6.46s': ' Trade', '6.8s': ' is', '6.98s': ' a', '7.06s': ' financial', '7.32s': ' activity', '8.02s': ' that', '8.28s': ' includes', '8.66s': ' buying', '8.98s': ' and', '9.24s': ' selling', '9.52s': ' various', '9.92s': ' goods', '10.24s': ' and', '10.44s': ' services', '10.86s': ' between', '11.3s': ' two', '11.64s': ' or', '11.8s': ' more', '11.92s': ' people', '12.32s': ' involved', '12.8s': ' in', '12.94s': ' the', '13.06s': ' transaction.', '14.72s': ' Trade', '15.04s': ' can', '15.22s': ' happen', '15.54s': ' between', '15.86s': ' organizations', '16.46s': ' and', '16.88s': ' countries', '17.24s': ' as', '17.52s': ' well.', '18.6s': ' For', '18.96s': ' example,', '19.82s': ' India', '20.04s': ' primarily', '20.62s': ' exports', '21.04s': ' products', '21.62s': ' such', '21.98s': ' as', '22.16s': ' rice', '22.32s': ' and', '22.58s': ' jewellery', '23.06s': ' and', '23.46s': ' imports', '23.78s': ' petroleum', '24.32s': ' and', '24.66s': ' electronic', '25.14s': ' components.', '26.479999999999997s': ' The', '27.04s': ' evolution', '27.48s': ' of', '27.7s': ' trade', '27.92s': ' across', '28.24s': ' the', '28.48s': ' world', '28.74s': ' has', '29.0s': ' been', '29.16s': ' closely', '29.52s': ' linked', '29.92s': ' with', '30.1s': ' the', '30.24s': ' development', '30.62s': ' of', '30.9s': ' the', '30.98s': ' money', '31.18s': ' system.', '32.08s': ' You', '32.2s': ' would', '32.32s': ' be', '32.42s': ' surprised', '32.9s': ' to', '33.08s': ' know', '33.24s': ' that', '33.42s': ' trade', '33.64s': ' across', '33.92s': ' continents', '34.46s': ' has', '34.7s': ' been', '34.88s': ' prevalent', '35.26s': ' in', '35.46s': ' our', '35.6s': ' world,', '36.18s': ' even', '36.36s': ' in', '36.5s': ' ancient', '36.74s': ' times.', '38.22s': ' While', '38.48s': ' ancient', '38.76s': ' trade', '39.12s': ' was', '39.32s': ' based', '39.66s': ' on', '39.78s': ' the', '39.9s': ' barter', '40.18s': ' system,', '41.06s': ' there', '41.16s': ' is', '41.3s': ' also', '41.66s': ' evidence', '41.98s': ' of', '42.22s': ' commodities', '42.68s': ' being', '43.04s': ' used', '43.42s': ' in', '43.58s': ' the', '43.68s': ' form', '43.9s': ' of', '44.12s': ' livestock,', '44.96s': ' salt,', '45.54s': ' metal,', '46.12s': ' rare', '46.22s': ' stones,', '46.86s': ' etc.', '48.24s': ' Pottery', '48.72s': ' traditions', '49.18s': ' were', '49.48s': ' popular', '49.94s': ' in', '50.16s': ' parts', '50.4s': ' of', '50.6s': ' the', '50.7s': ' world', '50.92s': ' such', '51.26s': ' as', '51.36s': ' Japan,', '52.16s': ' Korea,', '52.78s': ' China,', '53.08s': ' Mexico,', '54.1s': ' and', '54.16s': ' many', '54.4s': ' more.', '55.5s': ' The', '55.88s': ' Han', '56.06s': ' Dynasty,', '57.0s': ' which', '57.16s': ' ruled', '57.36s': ' China', '57.7s': ' from', '57.98s': ' 206', '58.62s': ' BC', '59.12s': ' to', '59.56s': ' 220', '59.98s': ' AD,', '60.92s': ' opened', '61.14s': ' up', '61.28s': ' the', '61.4s': ' Silk', '61.64s': ' Road', '61.88s': ' trading', '62.24s': ' route', '62.5s': ' between', '62.88s': ' China', '63.24s': ' and', '63.58s': ' Central', '63.9s': ' Asia.', '65.2s': ' Various', '65.72s': ' kinds', '66.0s': ' of', '66.18s': ' merchandise', '66.7s': ' traveled', '67.32s': ' along', '67.64s': ' the', '67.82s': ' Silk', '68.06s': ' Road,', '68.8s': ' making', '69.0s': ' it', '69.18s': ' one', '69.32s': ' of', '69.44s': ' the', '69.58s': ' oldest', '69.86s': ' routes', '70.14s': ' of', '70.38s': ' international', '70.7s': ' trade', '71.26s': ' in', '71.4s': ' the', '71.52s': ' world.', '72.78s': ' The', '72.98s': ' first', '73.28s': ' non', '73.5s': '-stop', '73.78s': ' voyages', '74.22s': ' from', '74.46s': ' Egypt', '74.82s': ' to', '75.18s': ' India', '75.54s': ' were', '75.9s': ' initiated', '76.48s': ' at', '76.82s': ' the', '76.94s': ' start', '77.12s': ' of', '77.3s': ' the', '77.4s': ' common', '77.66s': ' era.', '78.76s': ' Spices', '79.4s': ' from', '79.7s': ' India', '79.96s': ' came', '80.28s': ' in', '80.42s': ' demand', '80.64s': ' around', '81.0s': ' the', '81.18s': ' world', '81.54s': ' and', '81.8s': ' were', '81.92s': ' the', '82.04s': ' main', '82.28s': ' exports', '82.64s': ' to', '82.98s': ' the', '83.06s': ' Western', '83.38s': ' world.', '84.36s': ' The', '84.94s': ' spice', '85.26s': ' trade', '85.5s': ' led', '85.74s': ' to', '85.9s': ' new', '86.08s': ' diplomatic', '86.48s': ' relationships', '87.34s': ' between', '87.96s': ' East', '88.28s': ' and', '88.4s': ' West.', '89.36s': ' It', '89.98s': ' was', '90.08s': ' partly', '90.46s': ' with', '90.64s': ' the', '90.76s': ' spice', '91.06s': ' trade', '91.38s': ' in', '91.48s': ' mind', '91.8s': ' that', '92.1s': ' Christopher', '92.56s': ' set', '92.86s': ' out', '93.06s': ' in', '93.22s': ' 1492', '94.22s': ' and', '94.72s': ' discovered', '95.08s': ' America.'}, // Audio 4
  {'0.0s': ' Summary', '0.62s': ' Money', '1.84s': ' is', '2.1s': ' a', '2.2s': ' recognized', '2.68s': ' medium', '3.12s': ' of', '3.3s': ' exchange', '3.6s': ' in', '3.84s': ' the', '3.94s': ' economy.', '5.32s': ' A', '5.62s': ' bank', '5.86s': ' is', '6.04s': ' a', '6.14s': ' government', '6.4s': ' authorized', '6.94s': ' financial', '7.38s': ' institution,', '8.52s': ' which', '8.66s': ' acts', '8.94s': ' as', '9.12s': ' a', '9.22s': ' custodian', '9.8s': ' of', '9.92s': ' money', '10.16s': ' deposited', '10.7s': ' by', '10.94s': ' account', '11.26s': ' holders.', '12.8s': ' Historically', '13.4s': ' speaking,', '14.28s': ' humans', '14.5s': ' have', '14.72s': ' been', '14.88s': ' transacting', '15.5s': ' in', '15.72s': ' goods', '15.92s': ' much', '16.18s': ' before', '16.5s': ' money', '16.92s': ' was', '17.12s': ' invented.', '18.44s': ' While', '18.78s': ' ancient', '19.08s': ' trade', '19.4s': ' was', '19.6s': ' based', '19.96s': ' on', '20.06s': ' the', '20.18s': ' barter', '20.46s': ' system,', '21.32s': ' there', '21.46s': ' is', '21.6s': ' also', '21.94s': ' evidence', '22.26s': ' of', '22.52s': ' commodities', '22.96s': ' being', '23.32s': ' used', '23.72s': ' in', '23.86s': ' the', '23.98s': ' form', '24.18s': ' of', '24.4s': ' livestock,', '25.26s': ' salt,', '25.82s': ' metal,', '26.42s': ' rare', '26.5s': ' stones,', '27.14s': ' etc.', '27.52s': ' The', '28.78s': ' Han', '28.96s': ' Dynasty,', '29.94s': ' which', '30.1s': ' ruled', '30.28s': ' China', '30.62s': ' from', '30.92s': ' 206', '31.54s': ' BC', '32.02s': ' to', '32.48s': ' 220', '32.92s': ' AD,', '33.86s': ' opened', '34.06s': ' up', '34.18s': ' the', '34.32s': ' Silk', '34.58s': ' Road', '34.82s': ' Trading', '35.16s': ' Route', '35.48s': ' between', '35.8s': ' China', '36.26s': ' and', '36.48s': ' Central', '36.82s': ' Asia.'}
 // Audio 5
];

  const audioFiles = [audio1, audio2, audio3, audio4, audio5];

  // Function to toggle between audio and text mode
  // Inside your Lecture component

  // Ref for the play button in the audio mode section

  // Function to focus on the play button when switching to audio mode
  const focusOnPlayButton = () => {
    if (playButtonRef.current) {
      playButtonRef.current.focus();
    }
  };

  // Add helper function to find word at timestamp
const findWordAtTimestamp = (timestamp, audioIndex) => {
  const transcript = transcripts[audioIndex];
  const times = Object.keys(transcript)
    .map(t => parseFloat(t.replace('s','')))
    .sort((a,b) => a-b);
  
  // Find closest timestamp
  const closest = times.reduce((prev, curr) => {
    return (Math.abs(curr - timestamp) < Math.abs(prev - timestamp) ? curr : prev);
  });

  return transcript[closest + 's'];
};

  useEffect(() => {
    if (
      mode === "audio" &&
      playButtonRef.current &&
      playButtonRef.current.focus
    ) {
      // When mode changes to 'audio' and the play button ref is valid, focus on the play button
      playButtonRef.current.focus();
    }
  }, [mode, playButtonRef.current]);

  // Function to toggle between audio and text mode
  const toggleMode = () => {
    if (mode === "audio") {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      setMode("text");
      if (nextButtonRef.current) {
        nextButtonRef.current.focus();
      }
    } else {
      setMode("audio");
      if (playButtonRef.current) {
        playButtonRef.current.focus();
      }
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const word = findWordAtTimestamp(currentTime, currentPage);
      const replayString = `Audio ${currentAudioFile} - replay at ${Math.floor(currentTime)}s (word: "${word}")`;
      setAudioPlayEvents((prevEvents) => [...prevEvents, replayString]);
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  // New helper function to get pause & replay events data
  const getAudioEventsSummary = () => {
    const eventsByAudio = {};
    
    audioPlayEvents.forEach(event => {
      const [audioNum] = event.split(' - ');
      if (!eventsByAudio[audioNum]) {
        eventsByAudio[audioNum] = {
          pauses: new Set(),
          replays: new Set()
        };
      }
      
      if (event.includes('pause')) {
        eventsByAudio[audioNum].pauses.add(event.split('at ')[1]);
      } else if (event.includes('replay')) {
        eventsByAudio[audioNum].replays.add(event.split('at ')[1]);
      }
    });

    Object.keys(eventsByAudio).forEach(key => {
      eventsByAudio[key] = {
        pauses: Array.from(eventsByAudio[key].pauses),
        replays: Array.from(eventsByAudio[key].replays)
      };
    });
  
    return eventsByAudio;
  };


  // Function to set the current page and focus on the play button of the next or previous page

  // Inside your Lecture component
  const handleNextPage = () => {
    // Pause the audio before changing the page
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    // Update state to navigate to the next page
    setCurrentPageAndFocus(currentPage + 1);
  };
  

  // Function to set the current page and focus on the play button of the next or previous page
  const setCurrentPageAndFocus = (page) => {
    setCurrentPage(page);
    setCurrentAudioFile(page + 1);
    // Focus on the play button of the next page when in audio mode
    if (mode === "audio" && nextButtonsRefs.current[page + 1]) {
      const nextButton = nextButtonsRefs.current[page + 1];
      const playButton =
        nextButton.parentElement.querySelector(".play-pause-button");
      if (playButton) {
        playButton.focus();
      }
    }
    
    if (mode === "audio") {
      // Check if we are on a valid page and set the audio source
      if (page >= 0 && page < audioFiles.length) {
        audioRef.current.src = audioFiles[page];
        // Play the audio if it's not already playing
        if (audioRef.current.paused) {
          audioRef.current.play();
        }
      }
    }
  };
  
  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
    if (playButtonRef.current) {
      playButtonRef.current.focus();
    }
  };

  // Function to start the lecture
  const startLecture = () => {
    setLectureStarted(true);
    if (audioRef.current) {
      // console.log("##################audio commented");
      //audioRef.current.play();
    }
  };
  const startTextLecture = () => {
    setLectureStarted(true);
    setMode("text");
    if (audioRef.current) {
      // audioRef.current.play();
    }
  };


  // Function to end the lecture
  const endLecture = () => {
    const totalTimeTaken = totalTimer / 1000;
    const eventsSummary = getAudioEventsSummary();
    console.log("Audio Events Summary:", eventsSummary);
    // Dispatch the updateLectureInfo action with play and pause events
    dispatch(
      updateLectureInfo(
        audioTimer / 1000,
        textTimer / 1000,
        totalTimeTaken,
        audioPlayEvents,
        eventsSummary,
        pageAudio[0].val/1000,
        pageAudio[1].val/1000,
        pageAudio[2].val/1000,
        pageAudio[3].val/1000,
        pageAudio[4].val/1000,
        pageText[0].val/1000,
        pageText[1].val/1000,
        pageText[2].val/1000,
        pageText[3].val/1000,
        pageText[4].val/1000
      )
    );
    onCompletion(totalTimeTaken);
    setLectureStarted(false);
    setAudioTimer(0);
    setTextTimer(0);
    setTotalTimer(0);
    audioRef.current.pause();
  };

  useEffect(() => {
    const currentAudioRef = audioRef.current;
    let interval;

    const handlePlay = () => {
      // Start updating audio timer every second when audio is played and in 'audio' mode
      if (mode === "audio") {
        interval = setInterval(() => {
          setPageAudio((prevPageAudio) => {
            return prevPageAudio.map((curAudio) => {
              if (curAudio.id !== currentPage) {
                return curAudio; // Return unchanged if not the current page's audio
              } else {
                // Return updated audio with incremented 'val'
                return {
                  ...curAudio,
                  val: curAudio.val + 1000,
                };
              }
            });
          });
          setAudioTimer((prev) => prev + 1000);
          setTotalTimer((prev) => prev + 1000);
        }, 1000);
        handleAudioPlay();
      }
    };

    const handlePause = () => {
      // Clear interval when audio is paused
      clearInterval(interval);
      // Reset the audio timer to the current time only when in 'audio' mode
      if (mode === "audio") {
        setAudioTimer(audioRef.current.currentTime * 1000);
      }
      handleAudioPause(); //
    };

    const updateTextTimer = () => {
      // Update text timer every second when in 'text' mode
      if (mode === "text") {
        setPageText((prevPageAudio) => {
          return prevPageAudio.map((curAudio) => {
            if (curAudio.id !== currentPage) {
              return curAudio; // Return unchanged if not the current page's audio
            } else {
              // Return updated audio with incremented 'val'
              return {
                ...curAudio,
                val: curAudio.val + 1000,
              };
            }
          });
        });
        setTextTimer((prev) => prev + 1000);
        setTotalTimer((prev) => prev + 1000);
      }
    };

    if (currentAudioRef) {
      currentAudioRef.addEventListener("play", handlePlay);
      currentAudioRef.addEventListener("pause", handlePause);
    }

    // Start updating text timer when in 'text' mode
    if (mode === "text") {
      interval = setInterval(updateTextTimer, 1000);
    }

    return () => {
      if (currentAudioRef) {
        currentAudioRef.removeEventListener("play", handlePlay);
        currentAudioRef.removeEventListener("pause", handlePause);
      }
      // Clear interval when component unmounts
      clearInterval(interval);
    };
  }, [mode, currentPage]); // Dependency on mode and currentPage

  useEffect(() => {
    // Focus on the play button of the next page when currentPage changes
    if (mode === "audio" && nextButtonsRefs.current[currentPage]) {
      const nextButton = nextButtonsRefs.current[currentPage];
      const playButton =
        nextButton.parentElement.querySelector(".play-pause-button");
      if (playButton) {
        playButton.focus();
      }
    }
  }, [currentPage, mode, nextButtonsRefs]);

  // Function to set the current page and focus on the play button of the next or previous page

  return (
    <div className="mx-auto py-4 px-8">
      <h2 className="text-2xl font-semibold">Lecture</h2>
      <div className="mt-4">
        {!lectureStarted ? (
          <div>
            <h3>Please choose your preferred mode to start the lecture:</h3>
            <button
              onClick={startLecture}
              className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300 mr-2"
            >
              Start with Audio
            </button>
            <button
              onClick={startTextLecture}
              className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300"
            >
              Start with Text
            </button>
          </div>
        ) : (
          <div>
            {/* Render either audio or text based on the current mode */}
            {mode === "audio" ? (
              <div>
                {/* Audio mode */}
                {/* <div className="audio-controls">
                  <button
                    ref={playButtonRef}
                    onClick={() => {
                      if (audioRef.current.paused) {
                        audioRef.current.play();
                      } else {
                        audioRef.current.pause();
                      }
                    }}
                    className="play-pause-button"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "5px",
                      backgroundColor: "#FFFFFF",
                      color: "#000000",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                  >
                    {audioRef.current && audioRef.current.paused ? "▶" : "⏸"}
                  </button>
                </div> */}
                <div className="audio-container">
              <audio
                ref={audioRef}
                // src={audioFiles[currentPage]}
                controls
                onPause={handleAudioPause}
                onPlay={handleAudioPlay}
              >
                <source src={audioFiles[currentPage]} type="audio/mpeg"/>
              </audio>
              <button
                ref={replayButtonRef}
                onClick={handleReplay}
                aria-label="Replay Audio"
              >
                Replay
              </button>
            </div>
                
                <div>
                  <div>
                    {pageAudio.map(
                      (curPage) =>
                        curPage.id === currentPage && (
                          <div
                            key={curPage.id} // Add a unique key when iterating over arrays in React
                            style={{
                              position: "absolute",
                              top: "4rem",
                              right: 0,
                              padding: "0.5rem",
                              backgroundColor: "rgba(255, 255, 255, 0.8)",
                              borderRadius: "0 0 0.25rem 0.25rem",
                            }}
                          >
                            Audio {currentPage+1} Time: {Math.floor(curPage.val / 1000)}s
                          </div>
                        )
                    )}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      padding: "0.5rem",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "0 0 0.25rem 0.25rem",
                    }}
                  >
                    Audio Time: {Math.floor(audioTimer / 1000)}s
                  </div>
                </div>

                <div className="mt-2">
                  <button
                    onClick={toggleMode}
                    className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300"
                  >
                    Text Mode
                  </button>
                </div>
              </div>
            ) : (
              // Text mode
              <div>
                {/* Start Text Mode button */}
                <button className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300 mt-2">
                  Paragraph - {currentPage + 1}
                </button>
                <br />
                {pageContent[currentPage]}
                <div className="mt-2">
                  {pageText.map(
                    (curPage) =>
                      curPage.id === currentPage && (
                        <div
                          key={curPage.id} // Add a unique key when iterating over arrays in React
                          style={{
                            position: "absolute",
                            top: "4rem",
                            right: 0,
                            padding: "0.5rem",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            borderRadius: "0 0 0.25rem 0.25rem",
                          }}
                        >
                          Paragraph {currentPage+1} Time: {Math.floor(curPage.val / 1000)}s
                        </div>
                      )
                  )}
                  <div
                        className="text-time-container"
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          padding: "0.5rem",
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          borderRadius: "0 0 0.25rem 0.25rem",
                        }}
                      >
                        Text Time: {Math.floor(textTimer / 1000)}s
                      </div>
                  <button
                    onClick={toggleMode}
                    className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300"
                  >
                    Audio Mode
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Render "Next" and "Back" buttons separately */}
      {lectureStarted && (
        <div className="mt-2">
          {currentPage !== 0 && (
            <button
              onClick={handlePreviousPage} // Call handlePreviousPage function
              className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300 mr-2"
            >
              Back
            </button>
          )}
          {currentPage !== pageContent.length - 1 && (
            <button
              ref={nextButtonRef}
              onClick={handleNextPage}
              className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300"
            >
              Next
            </button>
          )}
        </div>
      )}
      {/* Render "End Lecture" button when on the last page */}
      {lectureStarted && currentPage === pageContent.length - 1 && (
        <button
          onClick={endLecture}
          ref={endLectureButtonRef}
          className="bg-white text-black py-2 px-4 rounded hover:bg-gray-400 border-[1px] border-black transition duration-300 mt-2"
        >
          End Lecture
        </button>
      )}
      {/* Hidden audio player */}
      <audio ref={audioRef} src={audioFiles[currentPage]} />
    </div>
  );
}