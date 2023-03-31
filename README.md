React useServerTime
===================

A hook which allows multiple clients to keep their clocks in-sync
with reasonable precision, eg

```ts
function MyClock() {
	const { now } = useServerTime("https://karakara.uk/time.json");

	return <div>The time is {now}</div>;
}
```

The given URL should return the current time in floating-point seconds

This hook will update the `now` value once per second, on the second

See [demo.html](demo.html) for a self-contained, well-commented example.

