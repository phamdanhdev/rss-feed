import React, { useState } from "react";
import "./style.scss";
import { Empty } from "antd";
import Sidebar from "../Sidebar";
import FeedItem from "../FeedItem";
let Parser = require("rss-parser");
let parser = new Parser();
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
//   let url = CORS_PROXY + "https://tuoitre.vn/";

export default function Feeds() {
  const [checkInputURL, setCheckInputURL] = useState({
    available: false,
    message: "",
    rssUrl: null,
  });

  const [urlRssList, setUrlRssList] = useState([]);
  const [feeds, setFeeds] = useState([]);

  const checkAvailableURL = (url) => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = async (progressEvent) => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        let xmlData = await xhr.response;
        let parser = new DOMParser();
        let doc = parser.parseFromString(xmlData, "text/html");
        let rssUrl = getRssUrl(doc);
        console.log(rssUrl);
        if (rssUrl) {
          setCheckInputURL({
            available: true,
            message: "This URL is available for RSS",
            rssUrl: rssUrl,
          });
        } else {
          setCheckInputURL({
            available: false,
            message: "This URL is not available for RSS",
            rssUrl: null,
          });
        }
      }
      if (xhr.status === 404 && xhr.readyState === 2) {
        setCheckInputURL({
          available: false,
          message: "This URL is not available for RSS",
          rssUrl: null,
        });
      }
    };
    xhr.open("GET", CORS_PROXY + url, true);
    xhr.send();
  };

  // const fetchXML = async (url) => {
  //   try {
  //     let xhr = new XMLHttpRequest();
  //     xhr.onreadystatechange = async (progressEvent) => {
  //       if (xhr.readyState === 4 && xhr.status === 200) {
  //         let xmlData = await xhr.response;
  //         let parser = new DOMParser();
  //         let doc = parser.parseFromString(xmlData, "text/html");
  //         let rssUrl = getRssUrl(doc);
  //         return getFeeds(rssUrl);
  //       }
  //     };
  //     xhr.open("GET", url, true);
  //     xhr.send();
  //   } catch (error) {
  //     console.log({ error });
  //     alert("This URL is not available!");
  //     return;
  //   }
  // };

  const getRssUrl = (xmlData) => {
    try {
      let linkElements = xmlData.getElementsByTagName("link");
      let rssUrl;
      [...linkElements].forEach((e) => {
        if (
          e.getAttribute("rel") === "alternate" &&
          e.getAttribute("type") === "application/rss+xml"
        ) {
          rssUrl = e.getAttribute("href");
        }
      });
      if (!rssUrl) throw new Error("This URL is not have URL RSS!");
      return rssUrl;
    } catch (error) {
      console.log("loi");
      setCheckInputURL({
        available: false,
        message: "This URL is not available",
      });
    }
  };

  const getFeeds = async (rssUrl) => {
    let feed = await parser.parseURL(CORS_PROXY + rssUrl);
    //   console.log(feed.title);

    //   feed.items.forEach((item) => {
    //     console.log(item.title + ":" + item.link);
    //   });

    let newData = feed.items.map((item) => ({
      title: item.title,
      link: item.link,
      contentSnippet: item.contentSnippet,
    }));

    setFeeds(newData);
  };

  const addUrlRss = () => {
    console.log(checkInputURL.rssUrl);
    if (checkInputURL.rssUrl !== null && checkInputURL.available) {
      setUrlRssList((preState) => [...preState, checkInputURL.rssUrl]);
    }
  };

  return (
    <div>
      {/* <button
        onClick={() =>
          fetchXML("https://cors-anywhere.herokuapp.com/https://tuoitre.vn/")
        }
      >
        Click
      </button> */}

      <div className="_wrapper">
        <div className="_sidebar">
          <Sidebar
            checkAvailableURL={checkAvailableURL}
            checkInputURL={checkInputURL}
            addUrlRss={addUrlRss}
            urlRssList={urlRssList}
            getFeeds={getFeeds}
          />
        </div>
        <div className="_content">
          <h4>Related Post</h4>
          {feeds.length === 0 ? (
            <div className="_emptyData">
              <Empty />
            </div>
          ) : (
            <div></div>
          )}
          <div className="_feeds">
            {feeds.map((item, index) => (
              <FeedItem key={index} feeds={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
