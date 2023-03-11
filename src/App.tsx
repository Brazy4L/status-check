import { useEffect, useState, Fragment } from "react";
import { data as initialData } from "./data";

interface DataItem {
  id: number;
  url: string;
  status: string;
}

interface Options {
  timeout: number;
  mode: string | any;
}

export default function App() {
  const [data, setData] = useState(initialData);
  const [input, setInput] = useState("");

  useEffect(() => {
    checkAll(data);
  }, []);

  async function fetchWithTimeout(url: string, options: Options) {
    const { timeout } = options;
    const controller = new AbortController();
    const signal = controller.signal;
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, {
      ...options,
      signal,
    });
    clearTimeout(id);
    return response;
  }

  async function checkConnection(url: string) {
    try {
      await fetchWithTimeout(url, {
        timeout: 2000,
        mode: "no-cors",
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async function checkAll(data: DataItem[]) {
    const removeStatus = data.map((item) => {
      return { ...item, status: "pending" };
    });
    setData(removeStatus);
    const results = await Promise.all(
      data.map((item) => checkConnection(item.url))
    );
    const addStatus = data.map((item, index) => {
      return { ...item, status: results[index].toString() };
    });
    setData(addStatus);
  }

  function removeProtocol(url: string) {
    return url.replace(/^https?:\/\//, "");
  }

  return (
    <div className="app">
      <input
        className="input"
        value={input}
        placeholder="example.com"
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="retry"
        onClick={() => {
          checkAll(data);
        }}
      >
        Retry All
      </button>
      <div className="data">
        {data.map((item) => (
          <a
            href={item.url}
            className="item"
            key={item.id}
            style={{
              backgroundColor:
                item.status === "true"
                  ? "#5fff89"
                  : item.status === "false"
                  ? "#ff5f60"
                  : "#fdff5f",
            }}
          >
            <div className="item__url">{removeProtocol(item.url)}</div>
            <button
              className="item__button"
              onClick={(e) => {
                e.preventDefault();
                setData(data.filter((i) => i.id !== item.id));
              }}
            >
              <div className="button__both button__first"></div>
              <div className="button__both button__second"></div>
            </button>
          </a>
        ))}
      </div>
    </div>
  );
}
