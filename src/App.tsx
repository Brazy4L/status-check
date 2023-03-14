import { useEffect, useState } from "react";
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

let nextId = 3;

export default function App() {
  const [data, setData] = useState(initialData);
  const [input, setInput] = useState("");

  useEffect(() => {
    checkAll(data);
  }, []);

  function addItem(url: string) {
    setData([
      ...data,
      {
        id: nextId++,
        url,
        status: "q",
      },
    ]);
  }

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
      return "true";
    } catch (error) {
      return "false";
    }
  }

  async function checkAll(data: DataItem[]) {
    const check = document.getElementById("check");
    check?.classList.toggle("rainbow");
    const removeStatus = data.map((item) => {
      return { ...item, status: "pending" };
    });
    setData(removeStatus);
    const results = await Promise.all(
      data.map((item) => checkConnection(item.url))
    );
    const addStatus = data.map((item, index) => {
      return { ...item, status: results[index] };
    });
    setData(addStatus);
    check?.classList.toggle("rainbow");
  }

  function addProtocol(url: string) {
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  }

  function removeProtocol(url: string) {
    return url.replace(/^https?:\/\//i, "");
  }

  return (
    <div className="app">
      <div className="add">
        <input
          className="input"
          value={input}
          placeholder="example.com"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              (!data[0] || data[0].status !== "pending")
            ) {
              addItem(addProtocol(input));
            }
          }}
        />
        <div className="line"></div>
      </div>
      <button
        id="check"
        className="check"
        onClick={() => {
          checkAll(data);
        }}
      >
        CHECK
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
                  : item.status === "pending"
                  ? "#fdff5f"
                  : "#c86bff",
            }}
          >
            <div className="item__url">{removeProtocol(item.url)}</div>
            <button
              className="item__button"
              onClick={(e) => {
                e.preventDefault();
                if (item.status !== "pending") {
                  setData(data.filter((i) => i.id !== item.id));
                }
              }}
              style={{ cursor: item.status === "pending" ? "wait" : "" }}
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
