#!/usr/bin/env python3
import argparse
import json
import os
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")

import matplotlib.dates as mdates
import matplotlib.pyplot as plt


def parse_soundcloud_date(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)


def main() -> None:
    parser = argparse.ArgumentParser(description="Plot accumulated SoundCloud likes over time.")
    parser.add_argument(
        "--input",
        default="src/lib/likes.json",
        help="Path to likes JSON. Default: src/lib/likes.json",
    )
    parser.add_argument(
        "--output",
        default="likes-over-time.png",
        help="Output image path. Default: likes-over-time.png",
    )
    args = parser.parse_args()

    with Path(args.input).open(encoding="utf-8") as file:
        data = json.load(file)

    day_counts = Counter(
        parse_soundcloud_date(like["created_at"]).date()
        for like in data["likes"]
        if like.get("created_at")
    )

    if not day_counts:
        raise SystemExit("No like timestamps found.")

    dates = sorted(day_counts)
    cumulative = []
    total = 0
    for day in dates:
        total += day_counts[day]
        cumulative.append(total)

    plt.style.use("seaborn-v0_8-whitegrid")
    fig, ax = plt.subplots(figsize=(13, 7), constrained_layout=True)
    ax.step(dates, cumulative, where="post", linewidth=2.4, color="#f26b38")
    ax.fill_between(dates, cumulative, step="post", alpha=0.12, color="#f26b38")

    ax.set_title("Accumulated SoundCloud Likes Over Time", fontsize=18, pad=18)
    ax.set_xlabel("Date")
    ax.set_ylabel("Total likes")
    ax.yaxis.set_major_formatter(lambda value, _: f"{int(value):,}")
    ax.xaxis.set_major_locator(mdates.MonthLocator(interval=3))
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %Y"))
    ax.margins(x=0.01, y=0.05)

    start_label = dates[0].strftime("%Y-%m-%d")
    end_label = dates[-1].strftime("%Y-%m-%d")
    ax.text(
        0.01,
        0.96,
        f"{total:,} likes from {start_label} to {end_label}",
        transform=ax.transAxes,
        fontsize=11,
        va="top",
        bbox={"facecolor": "white", "edgecolor": "#dddddd", "boxstyle": "round,pad=0.35"},
    )

    fig.autofmt_xdate()
    fig.savefig(args.output, dpi=180)
    print(f"Wrote {args.output} with {total:,} accumulated likes.")


if __name__ == "__main__":
    main()
