"use client";

import { forwardRef } from "react";
import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PkpButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "onclick" | "warnable" | "link";
  size?: "default" | "sm";
  loading?: boolean;
  asChild?: boolean;
  href?: string;
};

/**
 * PKP Button Component
 * Matches OJS 3.3 button styling exactly
 * Variants:
 * - primary: pkpButton--isPrimary (Blue button #006798)
 * - onclick: pkpButton--isOnclick (Outline button)
 * - warnable: pkpButton--isWarnable (Warning button)
 * - link: pkpButton--isLink (Link style button)
 */
export const PkpButton = forwardRef<HTMLButtonElement, PkpButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "default",
      loading = false,
      disabled,
      asChild = false,
      href,
      ...props
    },
    ref,
  ) => {
    const baseStyles = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "0.25rem",
      height: size === "sm" ? "1.875rem" : "2.25rem",
      paddingLeft: size === "sm" ? "0.75rem" : "1rem",
      paddingRight: size === "sm" ? "0.75rem" : "1rem",
      fontSize: "0.875rem",
      fontWeight: 600,
      border: "1px solid",
      cursor: "pointer",
      transition: "all 0.2s ease",
      textDecoration: "none",
    };

    const variantStyles: Record<typeof variant, React.CSSProperties> = {
      primary: {
        borderColor: "#006798",
        backgroundColor: "#006798",
        color: "#ffffff",
      },
      onclick: {
        borderColor: "#e5e5e5",
        backgroundColor: "transparent",
        color: "#002C40",
      },
      warnable: {
        borderColor: "#dc3545",
        backgroundColor: "#dc3545",
        color: "#ffffff",
      },
      link: {
        borderColor: "transparent",
        backgroundColor: "transparent",
        color: "#006798",
        textDecoration: "underline",
      },
    };

    const hoverStyles: Record<typeof variant, Partial<React.CSSProperties>> = {
      primary: {
        backgroundColor: "#005a82",
        borderColor: "#005a82",
      },
      onclick: {
        backgroundColor: "#f8f9fa",
        borderColor: "#d0d0d0",
      },
      warnable: {
        backgroundColor: "#c82333",
        borderColor: "#c82333",
      },
      link: {
        color: "#005a82",
        textDecoration: "underline",
      },
    };

    const buttonStyles = {
      ...baseStyles,
      ...variantStyles[variant],
      ...(disabled || loading
        ? {
            opacity: 0.6,
            cursor: "not-allowed",
          }
        : {}),
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
      if (!disabled && !loading) {
        Object.assign(e.currentTarget.style, hoverStyles[variant]);
      }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
      if (!disabled && !loading) {
        Object.assign(e.currentTarget.style, variantStyles[variant]);
      }
    };

    if (asChild) {
      // If asChild is true, render children directly (should be Link component)
      if (typeof children === "object" && children && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
          className: cn("pkpButton", `pkpButton--is${variant === "primary" ? "Primary" : variant === "onclick" ? "Onclick" : variant === "warnable" ? "Warnable" : "Link"}`, className),
          style: { ...buttonStyles, ...((children as React.ReactElement<any>).props?.style || {}) },
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
        });
      }
      return children;
    }

    if (href) {
      // Extract target and other link props
      const { target, ...linkProps } = props as any;
      return (
        <Link
          href={href}
          target={target}
          className={cn("pkpButton", `pkpButton--is${variant === "primary" ? "Primary" : variant === "onclick" ? "Onclick" : variant === "warnable" ? "Warnable" : "Link"}`, className)}
          style={buttonStyles}
          onMouseEnter={handleMouseEnter as any}
          onMouseLeave={handleMouseLeave as any}
          {...linkProps}
        >
          {loading && (
            <span
              style={{
                marginRight: "0.5rem",
                width: "0.875rem",
                height: "0.875rem",
                border: "2px solid rgba(255, 255, 255, 0.6)",
                borderTopColor: "currentColor",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.6s linear infinite",
              }}
            />
          )}
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={cn("pkpButton", `pkpButton--is${variant === "primary" ? "Primary" : variant === "onclick" ? "Onclick" : variant === "warnable" ? "Warnable" : "Link"}`, className)}
        style={buttonStyles}
        disabled={disabled ?? loading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {loading && (
          <span
            style={{
              marginRight: "0.5rem",
              width: "0.875rem",
              height: "0.875rem",
              border: "2px solid rgba(255, 255, 255, 0.6)",
              borderTopColor: "currentColor",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.6s linear infinite",
            }}
          />
        )}
        {children}
      </button>
    );
  },
);

PkpButton.displayName = "PkpButton";

