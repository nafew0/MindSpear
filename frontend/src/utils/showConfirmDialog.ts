import Swal from "sweetalert2";

type ConfirmDialogOptions = {
	title?: string;
	text: string;
	confirmButtonText?: string;
	cancelButtonText?: string;
	confirmButtonColor?: string;
};

class ConfirmDialog {
	static async show(
		options: ConfirmDialogOptions,
		onConfirm: () => Promise<void> | void
	) {
		await Swal.fire({
			title: options.title || "Are you sure?",
			text: options.text,
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: options.confirmButtonColor || "#ff0000",
			cancelButtonColor: "#F79945",
			confirmButtonText: options.confirmButtonText || "Confirm",
			cancelButtonText: options.cancelButtonText || "Cancel",
			reverseButtons: true,
		}).then(async (result) => {
			if (result.isConfirmed) {
				await onConfirm();
			}
		});
	}
}

export default ConfirmDialog;
