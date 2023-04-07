React useServerTime
===================

A hook which allows multiple clients to keep their clocks in-sync
with reasonable precision, eg

```ts
import { useServerTime } from "@shish2k/react-use-servertime";

function MyClock() {
	const { now } = useServerTime({url: "https://karakara.uk/time.json"});

	return <div>The time is {now}</div>;
}
```

The given URL should return the current time in floating-point seconds

This hook will update the `now` value once per second, on the second

If you have multiple places which want to use the time, you can use a
context provider so that multiple components share a single clock:

```ts
import { ServerTimeContext, ServerTimeProvider } from "@shish2k/react-use-servertime";

function MyClock() {
	const { now } = useContext(ServerTimeContext);

	return <div>The time is {now}</div>;
}

function App() {
	return <ServerTimeProvider url="https://karakara.uk/time.json">
		<MyClock />
	</ServerTimeProvider>
}
```

See [demo.html](demo.html) for a self-contained, well-commented example.

