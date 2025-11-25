#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix orphaned code blocks after function/export statements
Simple and direct approach
"""

import os
import re
from pathlib import Path

def fix_orphaned_code(file_path):
    """Remove orphaned code after function/export statements"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return False
    
    original_content = content
    lines = content.split('\n')
    new_lines = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Check if this is an export default statement (especially withAuth)
        if stripped.startswith('export default'):
            new_lines.append(line)
            i += 1
            
            # Check if next non-empty lines are orphaned JSX
            j = i
            orphaned_start = None
            while j < len(lines):
                next_line = lines[j]
                next_stripped = next_line.strip()
                
                if not next_stripped:
                    j += 1
                    continue
                
                # Check if it's a new export/function/const declaration - not orphaned
                if (next_stripped.startswith('export ') or 
                    next_stripped.startswith('function ') or 
                    (next_stripped.startswith('const ') and '=' in next_stripped and '=>' in next_stripped) or
                    next_stripped.startswith('import ') or
                    next_stripped.startswith('type ') or
                    next_stripped.startswith('interface ')):
                    break
                
                # Check if it looks like orphaned JSX/attributes
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
                    continue
                else:
                    # Not orphaned, break
                    break
            
            if orphaned_start is not None:
                print(f"  Removing orphaned code from line {orphaned_start+1}")
                i = orphaned_start
                continue
        
        # Check if this is a function closing brace
        if stripped == '}' and i > 0:
            # Look ahead to see if there's orphaned JSX
            j = i + 1
            orphaned_start = None
            
            while j < len(lines):
                next_line = lines[j]
                next_stripped = next_line.strip()
                
                if not next_stripped:
                    j += 1
                    continue
                
                # Check if it's a new export/function/const - not orphaned
                if (next_stripped.startswith('export ') or 
                    next_stripped.startswith('function ') or 
                    (next_stripped.startswith('const ') and '=' in next_stripped and '=>' in next_stripped) or
                    next_stripped.startswith('import ') or
                    next_stripped.startswith('type ') or
                    next_stripped.startswith('interface ')):
                    break
                
                # Check if it looks like orphaned JSX
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
                    continue
                else:
                    break
            
            if orphaned_start is not None:
                new_lines.append(line)
                print(f"  Removing orphaned code after function end at line {orphaned_start+1}")
                i = orphaned_start
                continue
        
        new_lines.append(line)
        i += 1
    
    new_content = '\n'.join(new_lines)
    
    if new_content != original_content:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        except Exception as e:
            print(f"Error writing {file_path}: {e}")
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
    
    print("Scanning for orphaned code...")
    
    # Process all TypeScript/TSX files
    for ext in ['*.ts', '*.tsx']:
        for file_path in src_dir.rglob(ext):
            total_files += 1
            if fix_orphaned_code(file_path):
                fixed_count += 1
                print(f"Fixed: {file_path.relative_to(project_root)}")
    
    print(f"\nFixed {fixed_count} out of {total_files} files")

if __name__ == '__main__':
    main()
