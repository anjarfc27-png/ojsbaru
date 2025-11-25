#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fast and aggressive fix for all duplicate/orphaned code issues
"""

import os
import re
from pathlib import Path

def fix_file_fast(file_path):
    """Aggressively fix all issues in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False
    
    original = content
    lines = content.split('\n')
    new_lines = []
    
    i = 0
    seen_exports = set()
    in_function = False
    brace_count = 0
    last_export_line = -1
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Track exports
        if stripped.startswith('export default'):
            export_key = stripped[:150]  # Use first 150 chars as key
            if export_key in seen_exports:
                # Skip duplicate export
                i += 1
                continue
            seen_exports.add(export_key)
            last_export_line = i
        
        # Track function braces
        if 'function' in stripped or (stripped.startswith('const ') and '=>' in stripped):
            in_function = True
            brace_count = 0
        
        brace_count += line.count('{') - line.count('}')
        
        # If we just closed a function and next lines are orphaned JSX
        if brace_count <= 0 and in_function and i > 0:
            # Check next non-empty lines
            j = i + 1
            orphaned_start = None
            while j < len(lines):
                next_stripped = lines[j].strip()
                if not next_stripped:
                    j += 1
                    continue
                # Check if it's a new declaration
                if (next_stripped.startswith('export ') or 
                    next_stripped.startswith('function ') or 
                    (next_stripped.startswith('const ') and '=' in next_stripped) or
                    next_stripped.startswith('import ') or
                    next_stripped.startswith('type ') or
                    next_stripped.startswith('interface ')):
                    break
                # Check if orphaned JSX
                if (next_stripped.startswith('<') or 
                    next_stripped.startswith('value=') or 
                    next_stripped.startswith('defaultChecked=') or
                    next_stripped.startswith('onChange=') or
                    next_stripped.startswith('style={{') or
                    next_stripped.startswith('fontSize:') or
                    next_stripped.startswith('color:') or
                    (next_stripped.startswith('{') and not next_stripped.startswith('{/*'))):
                    if orphaned_start is None:
                        orphaned_start = j
                    j += 1
                else:
                    break
            if orphaned_start:
                i = orphaned_start
                in_function = False
                continue
        
        # Check for orphaned code after export default
        if last_export_line == i - 1 and stripped:
            if (stripped.startswith('<') or 
                stripped.startswith('value=') or 
                stripped.startswith('defaultChecked=') or
                stripped.startswith('fontSize:') or
                stripped.startswith('color:')):
                # Skip orphaned JSX after export
                i += 1
                continue
        
        new_lines.append(line)
        i += 1
    
    # Additional cleanup: remove duplicate export patterns
    new_content = '\n'.join(new_lines)
    
    # Remove duplicate export default patterns
    pattern = r'(export default[^\n]+)\n\s*\1'
    new_content = re.sub(pattern, r'\1', new_content, flags=re.MULTILINE)
    
    # Remove orphaned JSX after export default (more aggressive)
    pattern2 = r'(export default[^\n]+)\n\s*(?:(?:<[^>]+>|value=|defaultChecked=|fontSize:|color:)[^\n]*)+\n*'
    new_content = re.sub(pattern2, r'\1\n', new_content, flags=re.MULTILINE)
    
    if new_content != original:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        except:
            return False
    
    return False

def main():
    project_root = Path(__file__).parent
    src_dir = project_root / 'src'
    
    if not src_dir.exists():
        print(f"Source directory not found: {src_dir}")
        return
    
    fixed_count = 0
    total_files = 0
    
    print("Fast fixing all files...")
    
    for ext in ['*.ts', '*.tsx']:
        for file_path in src_dir.rglob(ext):
            total_files += 1
            if fix_file_fast(file_path):
                fixed_count += 1
                print(f"Fixed: {file_path.relative_to(project_root)}")
    
    print(f"\nFixed {fixed_count} out of {total_files} files")

if __name__ == '__main__':
    main()


