export const formatReactedUsersTooltip = (users: any[], currentUserId: string, emoji: string): string => {
    console.log(currentUserId);
    console.log(users);
    

    const otherUsers = users.filter((u) => u._id !== currentUserId);
    const names = otherUsers.map((u) => u.fullName);
    const hasCurrentUser = users.some((u) => u._id === currentUserId);

    let label = '';

    if (hasCurrentUser) {
        label += 'You';
        if (names.length > 0) {
            label += ', ' + names.join(' and ');
        }
    } else {
        label += names.join(' and ');
    }

    return `${label} reacted with ${emoji}`;
};
