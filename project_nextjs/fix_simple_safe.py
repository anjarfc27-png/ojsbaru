#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple and safe - only removes duplicates and orphaned code, never adds
"""

import re
from pathlib import Path

def fix_file_simple(file_path):
    """Simply remove duplicates and orphaned code - never add anything"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return False
    
    original = content
    lines = content.split('\n')
    new_lines = []
    
    i = 0
    seen_exports = set()
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Remove duplicate export default (exact match on consecutive lines)
        if stripped.startswith('export default'):
            normalized = re.sub(r'\s+', ' ', stripped)
            if normalized in seen_exports:
                # Skip duplicate
                i += 1
                continue
            seen_exports.add(normalized)
        
        # Remove orphaned JSX after export default
        if i > 0 and lines[i-1].strip().startswith('export default'):
            if (stripped.startswith('value=') or 
                stripped.startswith('defaultChecked=') or
                stripped.startswith('fontSize:') or
                stripped.startswith('color:') or
                (stripped.startswith('style={{') and '}}' not in stripped)):
                # Skip orphaned
                i += 1
                continue
        
        # Remove orphaned code after function closing brace
        if stripped == '}' and i > 0:
            j = i + 1
            orphaned = False
            while j < len(lines):
                next_stripped = lines[j].strip()
                if not next_stripped:
                    j += 1
                    continue
                if (next_stripped.startswith('export ') or 
                    next_stripped.startswith('function ') or 
                    next_stripped.startswith('import ')):
                    break
                if (next_stripped.startswith('value=') or 
                    next_stripped.startswith('defaultChecked=') or
                    next_stripped.startswith('fontSize:') or
                    next_stripped.startswith('color:')):
                    orphaned = True
                    j += 1
                else:
                    break
            if orphaned:
                new_lines.append(line)
                i = j
                continue
        
        new_lines.append(line)
        i += 1
    
    new_content = '\n'.join(new_lines)
    
    if new_content != original:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        except:
            return False
    
    return False

def main():
    src_dir = Path('src')
    fixed = 0
    total = 0
    
    print("Simple safe fixing (removes only, never adds)...")
    
    for ext in ['*.ts', '*.tsx']:
        for file_path in src_dir.rglob(ext):
            total += 1
            if fix_file_simple(file_path):
                fixed += 1
                print(f"✓ {file_path}")
    
    print(f"\nFixed {fixed}/{total} files")

if __name__ == '__main__':
    main()

