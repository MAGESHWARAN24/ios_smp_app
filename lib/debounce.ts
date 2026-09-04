export function debounce<T extends (...args: any[]) => any>(
    callback: T,
    delay = 300
): (...args: Parameters<T>) => void
{
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (this: any, ...args: Parameters<T>): void
    {
        // Store the context for use in the timeout
        const context = this;

        // Clear any existing timer to reset the delay
        if (timeoutId !== null)
        {
            clearTimeout(timeoutId);
        }

        // Set a new timer
        timeoutId = setTimeout(() =>
        {
            // Execute the original callback function after the delay
            // using .apply to maintain the correct 'this' context and pass arguments
            callback.apply(context, args);
        }, delay);
    };
}