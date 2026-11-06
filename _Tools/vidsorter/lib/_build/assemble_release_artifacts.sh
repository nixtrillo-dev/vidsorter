#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
DIST_DIR="${PROJECT_ROOT}/dist"

cli_binaries=(
#    "vidsorter_android_aarch64"
#    "vidsorter_linux_aarch64"
#    "vidsorter_linux_amd64"
)
package_dirs=(
    "${DIST_DIR}/com.nixtrillo.vidsorter_linux_aarch64"
    "${DIST_DIR}/com.nixtrillo.vidsorter_linux_amd64"
)
package_subdirs=(arch debian fedora)
gui_source_architectures=(linux_aarch64 linux_amd64)
windows_gui_dir="${DIST_DIR}/com.nixtrillo.vidsorter_windows_amd64"
windows_program_dir="${windows_gui_dir}/payload/VidSorter"
windows_gui_binary="${windows_program_dir}/com.nixtrillo.vidsorter.exe"
windows_gui_source="${windows_gui_dir}/build/generated_app.cpp"

VERSION="$(sed -n 's/^[[:space:]]*"version":[[:space:]]*"\([^"]*\)".*/\1/p' "${PROJECT_ROOT}/vidsorter_config.json")"
if [[ -z "${VERSION}" ]]; then
    printf 'Could not read version from %s\n' "${PROJECT_ROOT}/vidsorter_config.json" >&2
    exit 1
fi

# Check all inputs before clearing the existing top-level release artifacts.
for binary in "${cli_binaries[@]}"; do
    if [[ ! -f "${PROJECT_ROOT}/${binary}" ]]; then
        printf 'Missing CLI binary: %s\n' "${PROJECT_ROOT}/${binary}" >&2
        exit 1
    fi
done

for architecture in "${gui_source_architectures[@]}"; do
    source="${DIST_DIR}/com.nixtrillo.vidsorter_${architecture}/build/generated_app.cpp"
    if [[ ! -f "${source}" ]]; then
        printf 'Missing generated GUI source: %s\n' "${source}" >&2
        exit 1
    fi
done

if [[ ! -f "${windows_gui_binary}" ]]; then
    printf 'Missing Windows GUI executable: %s\n' "${windows_gui_binary}" >&2
    exit 1
fi
if [[ ! -f "${windows_gui_source}" ]]; then
    printf 'Missing generated Windows GUI source: %s\n' "${windows_gui_source}" >&2
    exit 1
fi

for package_dir in "${package_dirs[@]}"; do
    for package_subdir in "${package_subdirs[@]}"; do
        found=0
        for package in "${package_dir}/${package_subdir}"/*; do
            if [[ -f "${package}" && ( "${package}" == *.deb || "${package}" == *.rpm || "${package}" == *.pkg.tar.zst ) ]]; then
                found=1
                break
            fi
        done
        if (( ! found )); then
            printf 'Missing install package in %s\n' "${package_dir}/${package_subdir}" >&2
            exit 1
        fi
    done
done

mkdir -p -- "${DIST_DIR}"
# Remove files and symlinks immediately inside dist; preserve its directories.
find "${DIST_DIR}" -maxdepth 1 -type f -delete
find "${DIST_DIR}" -maxdepth 1 -type l -delete

for binary in "${cli_binaries[@]}"; do
    cp -- "${PROJECT_ROOT}/${binary}" "${DIST_DIR}/${binary}_cli"
done

for architecture in "${gui_source_architectures[@]}"; do
    source="${DIST_DIR}/com.nixtrillo.vidsorter_${architecture}/build/generated_app.cpp"
    cp -- "${source}" "${DIST_DIR}/vidsorter_${architecture}_${VERSION}_gui_source.cpp"
done

cp -- "${windows_gui_source}" "${DIST_DIR}/vidsorter_windows_amd64_${VERSION}_gui_source.cpp"
python3 - "${windows_program_dir}" "${DIST_DIR}/vidsorter_windows_amd64_${VERSION}_gui.zip" <<'PY'
import pathlib
import sys
import zipfile

program_dir = pathlib.Path(sys.argv[1])
archive_path = pathlib.Path(sys.argv[2])
with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(program_dir.rglob("*")):
        if path.is_file():
            archive.write(path, path.relative_to(program_dir.parent))
PY

for package_dir in "${package_dirs[@]}"; do
    for package_subdir in "${package_subdirs[@]}"; do
        for package in "${package_dir}/${package_subdir}"/*; do
            if [[ -f "${package}" && ( "${package}" == *.deb || "${package}" == *.rpm || "${package}" == *.pkg.tar.zst ) ]]; then
                cp -- "${package}" "${DIST_DIR}/"
            fi
        done
    done
done

printf 'Release artifacts in %s: ' "${DIST_DIR}"
find "${DIST_DIR}" -maxdepth 1 -type f | wc -l
