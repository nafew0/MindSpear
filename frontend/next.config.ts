import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	images: {
		domains: ["mindspear.app", "admin.mindspear.app", "admin.dev.mindspear.app", "lh3.googleusercontent.com"],
	},
	webpack(config, { isServer }) {
		// Apply the node-loader for .node files
		config.module.rules.push({
			test: /\.node$/,
			use: "node-loader",
		});

		// Optionally, fix any issues with canvas module on the server
		if (isServer) {
			config.externals.push("canvas");
		}

		return config;
	},
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
