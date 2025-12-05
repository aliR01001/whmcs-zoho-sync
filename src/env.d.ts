/// <reference path="../.astro/types.d.ts" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

interface Env {
	whmcs: any;
}

declare namespace App {
	interface Locals extends Runtime {}
}