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
        timeout: 1000,
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

  return (
    <div className="app">
      <input
        className="input"
        value={input}
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
          <div className="item" key={item.id}>
            <div>{item.url}</div>
            <div>{item.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
