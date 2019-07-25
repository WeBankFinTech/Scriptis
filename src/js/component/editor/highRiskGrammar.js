const hql = [
    /Truncate\s*Table/i,
    /Drop\s*Table/i,
    /Drop\s*Function/i,
    /Drop\s*Database/i,
    /ALTER\s*DATABASE/i,
];

const python = [
    /sys/i,
    /os/i,
    /sc\.stop/i,
    /spark\.stop/i,
];

const scala = [
    /sc\.stop/i,
    /spark\.stop/i,
];

export default {
    hql,
    python,
    scala,
};
