const fs = require('fs');
const path = require('path');

const targetStr = "'http://localhost:5000";
const replacementStr = "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}";

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(targetStr)) {
        // Need to close the template literal with ` instead of '
        // E.g., 'http://localhost:5000/api/auth/login' -> `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`
        content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}$1`");
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
console.log('API URLs abstracted!');
