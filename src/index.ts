import React, { useEffect, useState } from "react";

export type ServerTimeProps = {
  url: string;
  samples?: number;
  interval?: number;
  sync?: number;
};

export type ServerTimeContextType = {
  now: number;
  offset: number;
  tweak: number;
  setTweak: (x: number) => void;
};

export function useServerTime(
  user_props: ServerTimeProps,
): ServerTimeContextType {
  const props = {
    samples: 5,
    interval: 1,
    sync: 60,
    ...user_props,
  };
  const [offsets, setOffsets] = useState<number[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [tweak, setTweak] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now() / 1000);

  // Sync immediately on startup, and then on a schedule if props.sync is set
  function sync(url: string) {
    const sent = Date.now() / 1000;
    fetch(url, { credentials: "omit" })
      .then((r) => r.json())
      .then((response) => {
        const server_time =
          typeof response == "number" ? response : response.time_s;
        const recvd = Date.now() / 1000;
        const ping = (recvd - sent) / 2;
        const offset = server_time - ping - sent;
        // TODO: if ping is too large, get a new sample
        // console.log("New offset", offset, offsets, props.samples);
        setOffsets((offsets) => {
          const new_offsets = [...offsets, offset];
          if (new_offsets.length > props.samples) {
            new_offsets.shift();
          }
          return new_offsets;
        });
      });
  }
  useEffect(() => {
    setOffset(
      offsets.length ? offsets.reduce((a, b) => a + b, 0) / offsets.length : 0,
    );
  }, [offsets]);
  useEffect(() => {
    sync(props.url);
    let sync_id: ReturnType<typeof setInterval> | null = null;
    if (props.sync > 0) {
      sync_id = setInterval(() => sync(props.url), props.sync * 1000);
    }
    return () => {
      sync_id && clearInterval(sync_id);
    };
  }, [props.url, props.sync]);

  // Update `now` on a regular interval
  useEffect(() => {
    let interval_id: ReturnType<typeof setTimeout> | null = null;
    function waitForNextInterval() {
      const now = Date.now() / 1000 + offset + tweak;
      setNow(now);
      interval_id = setTimeout(
        waitForNextInterval,
        (props.interval - (now % props.interval)) * 1000,
      );
    }
    waitForNextInterval();
    return () => {
      interval_id && clearInterval(interval_id);
    };
  }, [props.interval, offset, tweak]);

  return { now, offset, tweak, setTweak };
}

export const ServerTimeContext: React.Context<ServerTimeContextType> =
  React.createContext<ServerTimeContextType>({
    now: 0,
    offset: 0,
    tweak: 0,
    setTweak: () => {},
  });

export function ServerTimeProvider(
  props: ServerTimeProps & { children: React.ReactNode },
) {
  const value = useServerTime(props);
  return React.createElement(
    ServerTimeContext.Provider,
    {
      value,
    },
    props.children,
  );
}
