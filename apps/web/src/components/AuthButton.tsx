import { useEffect, useState } from "preact/hooks";
import { authClient } from "../lib/auth-client";

type AuthButtonVariant = "compact" | "desktop" | "mobile";

interface AuthButtonProps {
	variant?: AuthButtonVariant;
	className?: string;
}

export default function AuthButton({
	variant = "desktop",
	className = "",
}: AuthButtonProps) {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
	const [isWorking, setIsWorking] = useState(false);

	useEffect(() => {
		let cancelled = false;

		async function loadSession() {
			try {
				const { data: session } = await authClient.getSession();
				if (!cancelled) {
					setIsLoggedIn(!!session?.user);
				}
			} catch {
				if (!cancelled) {
					setIsLoggedIn(false);
				}
			}
		}

		loadSession();

		return () => {
			cancelled = true;
		};
	}, []);

	async function handleClick() {
		if (isWorking) {
			return;
		}

		// Not logged in → go to login page
		if (!isLoggedIn) {
			window.location.href = "/login";
			return;
		}

		// Logged in → sign out then return to home
		try {
			setIsWorking(true);
			await authClient.signOut();
			window.location.href = "/";
		} catch {
			setIsWorking(false);
		}
	}

	const baseLabel = isLoggedIn ? "Log out" : "Log in";
	const label = isWorking ? "Please wait..." : baseLabel;

	let variantClasses = "";

	if (variant === "compact") {
		variantClasses =
			"btn btn-xs sm:btn-sm btn-outline text-white dark:text-neutral-900 border-white/30 dark:border-neutral-900/30 hover:bg-white/20 dark:hover:bg-neutral-900/10 font-bold transition-all whitespace-nowrap";
	} else if (variant === "mobile") {
		variantClasses =
			"btn btn-outline hover:bg-base-200 text-base-content border-base-content/30 btn-md md:btn-lg w-full font-bold focus-visible:ring-2 ring-primary outline-none";
	} else {
		variantClasses =
			"btn btn-outline border-base-content/20 text-base-content hover:bg-base-200 md:btn-md font-bold focus-visible:ring-2 ring-primary ring-offset-2 ring-offset-base-100 outline-none";
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			class={`${variantClasses} ${className}`}
			disabled={isWorking}
		>
			{label}
		</button>
	);
}

