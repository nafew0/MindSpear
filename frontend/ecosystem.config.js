module.exports = {
	apps: [
		{
			name: "mindspear-frontend",
			script: "node_modules/next/dist/bin/next",
			args: "start -p 2000",
			cwd: "/var/www/mindspear/frontend",
			instances: 1,
			exec_mode: "fork",
			autorestart: true,
			watch: false,
			max_memory_restart: "512M",
			env: {
				NODE_ENV: "production",
				PORT: 2000,
			},
			error_file: "/var/log/mindspear/frontend.err.log",
			out_file: "/var/log/mindspear/frontend.out.log",
			merge_logs: true,
		},
	],
};
